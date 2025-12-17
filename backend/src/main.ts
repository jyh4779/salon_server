import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

// BigInt serialization issue solution
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

import * as cookieParser from 'cookie-parser';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    app.use(cookieParser());

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
    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
