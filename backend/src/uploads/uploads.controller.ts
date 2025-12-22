import { Controller, Post, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post(':category')
    @UseInterceptors(FileInterceptor('file', {
        storage: memoryStorage(), // Use memory storage to get buffer
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 10 * 1024 * 1024 // Increase limit to 10MB to accept high-res photos before compression
        }
    }))
    async uploadFile(@Param('category') category: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }

        return this.uploadsService.compressAndSaveImage(category, file);
    }
}
