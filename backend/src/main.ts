import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

// BigInt serialization issue solution
(BigInt.prototype as any).toJSON = function () {
    return Number(this);
};

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    // CORS enable (Frontend is running on different port)
    app.enableCors();
    await app.listen(3000);
    console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
