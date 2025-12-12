import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { PrismaService } from './prisma/prisma.service';
import { ReservationsModule } from './reservations/reservations.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        ReservationsModule,
    ],
    providers: [PrismaService],
})
export class AppModule { }
