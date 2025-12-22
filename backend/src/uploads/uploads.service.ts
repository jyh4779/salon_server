import { Injectable, BadRequestException } from '@nestjs/common';
import * as sharp from 'sharp';
import { extname, join } from 'path';
import { existsSync, mkdirSync, writeFile } from 'fs';
import { promisify } from 'util';
import { UPLOAD_ROOT, UPLOAD_CATEGORIES } from '../config/upload.config';

const writeFileAsync = promisify(writeFile);

@Injectable()
export class UploadsService {
    async compressAndSaveImage(category: string, file: Express.Multer.File): Promise<{ url: string; originalName: string }> {
        if (!UPLOAD_CATEGORIES.includes(category)) {
            throw new BadRequestException('Invalid category');
        }

        const uploadPath = join(UPLOAD_ROOT, category);
        if (!existsSync(uploadPath)) {
            mkdirSync(uploadPath, { recursive: true });
        }

        // Generate random filename
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        // Force jpg extension for consistency after compression, or keep original if needed.
        // Let's us .jpg (or .webp) for the compressed file.
        const extension = '.jpg';
        const filename = `${randomName}${extension}`;
        const filePath = join(uploadPath, filename);

        try {
            // Process image with sharp
            // 1. Resize to max width 1920px (preserving aspect ratio)
            // 2. Auto-rotate based on EXIF
            // 3. Compress to JPEG with 80% quality
            const buffer = await sharp(file.buffer)
                .rotate() // Handle Exif orientation
                .resize(1920, null, { withoutEnlargement: true }) // Max width 1920
                .jpeg({ quality: 80 }) // Compress as JPEG
                .toBuffer();

            // Save to disk
            await writeFileAsync(filePath, buffer);

            return {
                url: `/uploads/${category}/${filename}`,
                originalName: file.originalname,
            };
        } catch (error) {
            console.error('Image compression failed:', error);
            throw new BadRequestException('Failed to process image');
        }
    }
}
