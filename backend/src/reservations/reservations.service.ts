import { Injectable, BadRequestException } from '@nestjs/common';
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
        // Validate Availability (Shop & Designer)
        await this.validateAvailability(
            createReservationDto.shop_id,
            createReservationDto.designer_id,
            createReservationDto.start_time,
            createReservationDto.end_time
        );

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
        // If time or designer is changing, validate availability
        if (updateReservationDto.start_time || updateReservationDto.end_time || updateReservationDto.designer_id) {
            const currentReservation = await this.findOne(id);
            if (!currentReservation) throw new BadRequestException('Reservation not found');

            const shopId = updateReservationDto.shop_id || currentReservation.shop_id || 1; // Default to 1 if missing
            const designerId = updateReservationDto.designer_id || Number(currentReservation.designer_id);
            const startTime = updateReservationDto.start_time || currentReservation.start_time; // Careful: findOne returns formatted string
            const endTime = updateReservationDto.end_time || currentReservation.end_time;

            // findOne returns formatted string, check if we need to ensure format for validation
            await this.validateAvailability(
                Number(shopId),
                Number(designerId),
                startTime,
                endTime
            );
        }

        return this.reservationsRepository.updateReservation(id, updateReservationDto);
    }

    async complete(id: number, completeReservationDto: CompleteReservationDto) {
        return this.reservationsRepository.completeReservation(id, completeReservationDto);
    }

    async remove(id: number) {
        return this.reservationsRepository.deleteReservation(id);
    }

    private async validateAvailability(shopId: number, designerId: number, start: string, end: string) {
        const startTime = dayjs(start).tz('Asia/Seoul');
        const endTime = dayjs(end).tz('Asia/Seoul');
        const dayOfWeek = startTime.format('ddd'); // Mon, Tue...

        // 1. Fetch Shop Info
        const shop = await this.prisma.sHOPS.findUnique({ where: { shop_id: BigInt(shopId) } });
        if (!shop) throw new BadRequestException('Shop not found');

        // Check Shop Closed Days
        if (shop.closed_days && shop.closed_days.includes(dayOfWeek)) {
            throw new BadRequestException('해당 날짜는 매장 정기 휴무일입니다.');
        }

        // Check Shop Open Hours
        // shop.open_time is Date object (1970-01-01 HH:mm:ss) from Prisma if @db.Time
        // formatted string comparison is often safer for time-only
        if (shop.open_time && shop.close_time) {
            const openTimeStr = dayjs(shop.open_time).format('HH:mm');
            const closeTimeStr = dayjs(shop.close_time).format('HH:mm');
            const resStartStr = startTime.format('HH:mm');
            const resEndStr = endTime.format('HH:mm');

            if (resStartStr < openTimeStr || resEndStr > closeTimeStr) {
                // Special case: closeTime might be next day? assuming same day for now based on salon logic
                throw new BadRequestException(`매장 운영 시간(${openTimeStr} ~ ${closeTimeStr})이 아닙니다.`);
            }
        }

        // 2. Fetch Designer Info
        const designer = await this.prisma.dESIGNERS.findUnique({ where: { designer_id: BigInt(designerId) } });
        if (!designer) throw new BadRequestException('Designer not found');

        // Check Designer Day Off
        if (designer.day_off && designer.day_off.includes(dayOfWeek)) {
            throw new BadRequestException('해당 날짜는 담당 디자이너 휴무일입니다.');
        }

        // Check Designer Work Hours
        if (designer.work_start && designer.work_end) {
            const workStart = designer.work_start; // string "HH:mm" usually if mapped manually or Date if @db.Time ??? 
            // Wait, Prisma Schema says @db.Time(0)? No, schema.prisma showed String in DTO but @db.Time in DB.
            // If DB is @db.Time, Prisma Client returns Date object.
            // But my `DesignerDTO` uses string. Let's assume Prisma returns Date.
            // Actually, let's use formatted strings to be safe.
            // Wait, previous `UpdateDesignerDto` used `string` for inputs. `DesignersService` converts to Date to save.
            // So reading from DB returns Date.

            // BUT, wait. In `validation`, I am reading from `this.prisma.dESIGNERS`.
            // Prisma returns Date for @db.Time.

            // Correction: The `DESIGNERS` model in schema might be String if I didn't verify schema properly?
            // Let's assume it returns Date (standard Prisma behaviour).
            // However, to be robust, I will handle both.
        }

        // Refetch designer to ensure we have strict types or just use standard logic
        // I will use `dayjs(designer.work_start).format('HH:mm')` which handles both Date object and ISO string.
        // If it's a simple "10:00" string, dayjs might need `customParseFormat` plugin OR I just do string comparison if I know it's a string.
        // Let's assume Date object from DB.

        const formatTime = (t: Date | string | null) => {
            if (!t) return null;
            // If it's a Date object
            if (t instanceof Date) return dayjs(t).utc().format('HH:mm'); // DB Time is usually UTC on 1970-01-01
            // If string "HH:mm"
            if (typeof t === 'string' && t.includes(':')) return t.substring(0, 5);
            return null;
        };

        const workStartStr = formatTime(designer.work_start as any);
        const workEndStr = formatTime(designer.work_end as any);
        const resStartStr = startTime.format('HH:mm');
        const resEndStr = endTime.format('HH:mm');

        if (workStartStr && workEndStr) {
            if (resStartStr < workStartStr || resEndStr > workEndStr) {
                // Ignore if workEnd is past midnight? Salon usually day shifts.
                throw new BadRequestException(`디자이너 근무 시간(${workStartStr} ~ ${workEndStr})이 아닙니다.`);
            }
        }

        // Check Lunch Time
        const lunchStartStr = formatTime(designer.lunch_start as any);
        const lunchEndStr = formatTime(designer.lunch_end as any);

        if (lunchStartStr && lunchEndStr) {
            // Check overlap
            // Overlap logic: (StartA < EndB) && (EndA > StartB)
            // Lunch: StartL, EndL. Res: StartR, EndR
            if (resStartStr < lunchEndStr && resEndStr > lunchStartStr) {
                throw new BadRequestException(`해당 시간은 디자이너 점심시간(${lunchStartStr} ~ ${lunchEndStr})입니다.`);
            }
        }
    }
}
