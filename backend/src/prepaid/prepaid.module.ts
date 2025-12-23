import { Module } from '@nestjs/common';
import { PrepaidController } from './prepaid.controller';
import { PrepaidService } from './prepaid.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [PrepaidController],
    providers: [PrepaidService],
    exports: [PrepaidService],
})
export class PrepaidModule { }
