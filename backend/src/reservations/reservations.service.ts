import { Injectable } from '@nestjs/common';
import { GetReservationsDto } from './dto/get-reservations.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ReservationsRepository } from './reservations.repository';

dayjs.extend(utc);
dayjs.extend(timezone);

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
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

    async findOne(id: number) {
        const reservation = await this.reservationsRepository.getReservationById(id);
        if (!reservation) return null;

        return {
            ...reservation,
            start_time: dayjs(reservation.start_time).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss+09:00'),
            end_time: dayjs(reservation.end_time).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss+09:00'),
        };
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

    async update(id: number, updateReservationDto: UpdateReservationDto) {
        // 메뉴 가격/이름 등 변경 시 로직 필요할 수 있음
        // 지금은 단순히 업데이트
        return this.reservationsRepository.updateReservation(id, updateReservationDto);
    }

    async remove(id: number) {
        return this.reservationsRepository.deleteReservation(id);
    }
}
