import { Injectable } from '@nestjs/common';
import { GetReservationsDto } from './dto/get-reservations.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ReservationsRepository } from './reservations.repository';

dayjs.extend(utc);
dayjs.extend(timezone);

import { CreateReservationDto } from './dto/create-reservation.dto';
import { PrismaService } from '../prisma/prisma.service'; // Need PrismaService to fetch menu or use another service/repository

@Injectable()
export class ReservationsService {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private prisma: PrismaService
    ) { }

    async findAll(query: GetReservationsDto) {
        // ... existing findAll code ...
        const { startDate, endDate } = query;

        const reservations = await this.reservationsRepository.getReservations(startDate, endDate);

        return reservations.map(reservation => ({
            ...reservation,
            start_time: dayjs(reservation.start_time).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss+09:00'),
            end_time: dayjs(reservation.end_time).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss+09:00'),
        }));
    }

    async create(createReservationDto: CreateReservationDto) {
        let menuData = null;
        if (createReservationDto.treatment_id) {
            const menu = await this.prisma.mENUS.findUnique({
                where: { menu_id: createReservationDto.treatment_id }
            });
            if (menu) {
                menuData = { name: menu.name, price: menu.price };
            }
        }

        return this.reservationsRepository.createReservation({
            ...createReservationDto,
            menu: menuData
        });
    }
}
