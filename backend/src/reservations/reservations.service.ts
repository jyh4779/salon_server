import { Injectable } from '@nestjs/common';
import { GetReservationsDto } from './dto/get-reservations.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ReservationsRepository } from './reservations.repository';
import { CompleteReservationDto } from './dto/complete-reservation.dto';

dayjs.extend(utc);
dayjs.extend(timezone);

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsService {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private prisma: PrismaService
    ) { }

    async findAll(query: GetReservationsDto) {
        // Validation handled by DTO + Pipe
        const { startDate, endDate } = query;

        const reservations = await this.reservationsRepository.getReservations(startDate, endDate);

        return reservations.map(reservation => ({
            ...reservation,
            // Convert UTC to Asia/Seoul for display/logic if needed, 
            // but usually Frontend handles display. 
            // Here just ensuring format is ISO string or specific format.
            // If DB stores UTC, Prisma returns Date object.
            // Let's keep it simple: return as is, or format if specifically requested.
            // Existing code likely did formatting:
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
        return this.reservationsRepository.updateReservation(id, updateReservationDto);
    }

    async complete(id: number, completeReservationDto: CompleteReservationDto) {
        return this.reservationsRepository.completeReservation(id, completeReservationDto);
    }

    async remove(id: number) {
        return this.reservationsRepository.deleteReservation(id);
    }
}
