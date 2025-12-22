import { Controller, Post, Param, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { UPLOAD_CATEGORIES, UPLOAD_ROOT } from '../config/upload.config';

@Controller('uploads')
export class UploadsController {
    @Post(':category')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: (req, file, cb) => {
                const category = req.params.category;

                if (!UPLOAD_CATEGORIES.includes(category)) {
                    return cb(new BadRequestException('Invalid category'), null);
                }

                const uploadPath = join(UPLOAD_ROOT, category);

                if (!existsSync(uploadPath)) {
                    mkdirSync(uploadPath, { recursive: true });
                }

                cb(null, uploadPath);
            },
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                const extension = extname(file.originalname);
                cb(null, `${randomName}${extension}`);
            }
        }),
        fileFilter: (req, file, cb) => {
            if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
                return cb(new BadRequestException('Only image files are allowed!'), false);
            }
            cb(null, true);
        },
        limits: {
            fileSize: 5 * 1024 * 1024 // 5MB
        }
    }))
    uploadFile(@Param('category') category: string, @UploadedFile() file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException('File is required');
        }
        // Return the public URL
        // Assuming the server is running on localhost:3000 (or configured host)
        // The ServeStaticModule serves 'uploads' folder at '/uploads' route.
        // So if category is 'designers', file is at '/uploads/designers/filename.ext'

        // Construct simplified URL path. Frontend can prepend API_BASE_URL or just use relative if proxy.
        // However, usually we return full path or absolute path from root.
        // Since ServeStatic is at /uploads, we return `/uploads/${category}/${file.filename}`

        return {
            url: `/uploads/${category}/${file.filename}`,
            originalName: file.originalname,
        };
    }
}
