import { Module } from '@nestjs/common';
import { DesignersService } from './designers.service';
import { DesignersController } from './designers.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [DesignersController],
    providers: [DesignersService],
})
export class DesignersModule { }
