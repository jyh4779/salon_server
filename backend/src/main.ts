import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// BigInt serialization issue solution
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

import * as cookieParser from 'cookie-parser';
import * as admin from 'firebase-admin';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

    // Initialize Firebase Admin (Safe check)
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault() // Or use process.env.FIREBASE_CREDENTIALS if set
            });
            console.log('[main] Firebase Admin Initialized');
        } catch (error) {
            console.warn('[main] Firebase Admin Initialization Failed (Ignoring for now):', error.message);
        }
    }

    // Enable ValidationPipe for DTO validation and transformation
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true, // Strip properties not in DTO
        transform: true, // Auto-transform types (e.g. string -> number)
        forbidNonWhitelisted: true, // Throw error if extra properties are sent
    }));

    // CORS enable (Frontend is running on different port)
    app.enableCors({
        origin: true, // Allow all for dev, or specify frontend URL
        credentials: true, // Allow cookies
    });
    await app.listen(3000, '0.0.0.0');
    console.log(`Application is running on: ${await app.getUrl()}`);

    const dbUrl = process.env.DATABASE_URL;
    if (dbUrl) {
        // Log only the HOST part to avoid leaking passwords
        console.log(`[DEBUG] Connecting to DB Host: ${dbUrl.split('@')[1]?.split(':')[0]}`);
    }
}
bootstrap();
