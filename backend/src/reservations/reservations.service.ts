import { Injectable } from '@nestjs/common';
import { GetReservationsDto } from './dto/get-reservations.dto';
import * as dayjs from 'dayjs';
import * as utc from 'dayjs/plugin/utc';
import * as timezone from 'dayjs/plugin/timezone';
import { ReservationsRepository } from './reservations.repository';

dayjs.extend(utc);
dayjs.extend(timezone);

@Injectable()
export class ReservationsService {
    constructor(private reservationsRepository: ReservationsRepository) { }

    async findAll(query: GetReservationsDto) {
        const { startDate, endDate } = query;

        const reservations = await this.reservationsRepository.getReservations(startDate, endDate);

        return reservations.map(reservation => ({
            ...reservation,
            start_time: dayjs(reservation.start_time).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss+09:00'),
            end_time: dayjs(reservation.end_time).tz('Asia/Seoul').format('YYYY-MM-DDTHH:mm:ss+09:00'),
        }));
    }
}
