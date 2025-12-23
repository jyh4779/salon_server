import { Module } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { ReservationsController } from './reservations.controller';
import { PrismaService } from '../prisma/prisma.service';
import { ReservationsRepository } from './reservations.repository';

import { PrepaidModule } from '../prepaid/prepaid.module';

@Module({
    imports: [PrepaidModule],
    controllers: [ReservationsController],
    providers: [ReservationsService, PrismaService, ReservationsRepository],
})
export class ReservationsModule { }
