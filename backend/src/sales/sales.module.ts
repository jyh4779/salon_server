import { Module } from '@nestjs/common';
import { SalesController } from './sales.controller';
import { SalesService } from './sales.service';
import { PrismaModule } from '../prisma/prisma.module';
import { TimeModule } from '../common/time/time.module';

@Module({
    imports: [PrismaModule, TimeModule],
    controllers: [SalesController],
    providers: [SalesService],
})
export class SalesModule { }
