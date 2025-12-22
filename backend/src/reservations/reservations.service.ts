import { Injectable, BadRequestException } from '@nestjs/common';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { ReservationsRepository } from './reservations.repository';
import { CompleteReservationDto } from './dto/complete-reservation.dto';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

@Injectable()
export class ReservationsService {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private prisma: PrismaService,
        private timeService: TimeService
    ) { }

    async findAll(shopId: number, query: GetReservationsDto) {
        const { startDate, endDate } = query;

        const reservations = await this.reservationsRepository.getReservations(shopId, startDate, endDate);

        return reservations.map(reservation => ({
            ...reservation,
            start_time: reservation.start_time.toISOString(),
            end_time: reservation.end_time.toISOString(),
        }));
    }

    async findOne(shopId: number, id: number) {
        const reservation = await this.reservationsRepository.getReservationById(shopId, id);
        if (!reservation) return null;

        return {
            ...reservation,
            shop_id: Number(reservation.shop_id), // BigInt -> Number
            start_time: reservation.start_time.toISOString(),
            end_time: reservation.end_time.toISOString(),
        };
    }

    async create(createReservationDto: CreateReservationDto) {
        const validation = await this.validateAvailability(
            createReservationDto.shop_id,
            createReservationDto.designer_id,
            createReservationDto.start_time,
            createReservationDto.end_time,
            createReservationDto.force
        );

        if (validation && validation.status === 'CONFLICT') {
            return validation;
        }

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

    async update(shopId: number, id: number, updateReservationDto: UpdateReservationDto) {
        if (updateReservationDto.start_time || updateReservationDto.end_time || updateReservationDto.designer_id) {
            const currentReservation = await this.findOne(shopId, id);
            if (!currentReservation) throw new BadRequestException('Reservation not found');

            // shopId is already validated by guard/controller param
            const designerId = updateReservationDto.designer_id || Number(currentReservation.designer_id);
            const startTime = updateReservationDto.start_time || currentReservation.start_time;
            const endTime = updateReservationDto.end_time || currentReservation.end_time;

            const conflict = await this.validateAvailability(shopId, designerId, startTime, endTime, updateReservationDto.force);

            if (conflict && conflict.status === 'CONFLICT') {
                return conflict;
            }
        }

        return this.reservationsRepository.updateReservation(shopId, id, updateReservationDto);
    }

    async complete(shopId: number, id: number, completeReservationDto: CompleteReservationDto) {
        return this.reservationsRepository.completeReservation(shopId, id, completeReservationDto);
    }

    async remove(shopId: number, id: number) {
        return this.reservationsRepository.deleteReservation(shopId, id);
    }

    private async validateAvailability(shopId: number, designerId: number, start: string, end: string, force: boolean = false) {
        const startTime = this.timeService.parse(start);
        const endTime = this.timeService.parse(end);
        const dayOfWeek = startTime.format('ddd'); // Mon, Tue...

        // 1. Fetch Shop Info
        const shop = await this.prisma.sHOPS.findUnique({ where: { shop_id: BigInt(shopId) } });
        if (!shop) throw new BadRequestException('Shop not found');

        // Check Shop Closed Days
        if (shop.closed_days && shop.closed_days.includes(dayOfWeek)) {
            throw new BadRequestException('해당 날짜는 매장 정기 휴무일입니다.');
        }

        // Check Shop Open Hours
        if (shop.open_time && shop.close_time) {
            const openTimeStr = this.timeService.toUtcTimeStr(shop.open_time);
            const closeTimeStr = this.timeService.toUtcTimeStr(shop.close_time);
            const resStartStr = startTime.format('HH:mm');
            const resEndStr = endTime.format('HH:mm');

            if (openTimeStr && closeTimeStr) {
                if (resStartStr < openTimeStr || resEndStr > closeTimeStr) {
                    if (closeTimeStr < openTimeStr) {
                        if (!(resStartStr >= openTimeStr || resEndStr <= closeTimeStr)) {
                            throw new BadRequestException(`매장 운영 시간(${openTimeStr} ~ ${closeTimeStr})이 아닙니다.`);
                        }
                    } else {
                        if (resStartStr < openTimeStr || resEndStr > closeTimeStr) {
                            throw new BadRequestException(`매장 운영 시간(${openTimeStr} ~ ${closeTimeStr})이 아닙니다.`);
                        }
                    }
                }
            }
        }

        // 2. Fetch Designer Info
        const designer = await this.prisma.dESIGNERS.findUnique({ where: { designer_id: BigInt(designerId) } });
        if (!designer) throw new BadRequestException('Designer not found');

        // Check Designer Day Off
        if (designer.day_off && designer.day_off.includes(dayOfWeek)) {
            if (!force) {
                return {
                    status: 'CONFLICT',
                    code: 'DESIGNER_DAY_OFF',
                    message: '해당 날짜는 담당 디자이너 휴무일입니다.'
                };
            }
        }

        const resStartStr = startTime.format('HH:mm');
        const resEndStr = endTime.format('HH:mm');

        const workStartStr = this.timeService.toUtcTimeStr(designer.work_start as any);
        const workEndStr = this.timeService.toUtcTimeStr(designer.work_end as any);

        if (workStartStr && workEndStr) {
            if (resStartStr < workStartStr || resEndStr > workEndStr) {
                if (!force) {
                    return {
                        status: 'CONFLICT',
                        code: 'BLOCK_CONFLICT',
                        message: `디자이너 근무 시간(${workStartStr} ~ ${workEndStr})이 아닙니다. 계속 진행하시겠습니까?`,
                        details: { type: 'WORK_HOURS', start: workStartStr, end: workEndStr }
                    };
                }
            }
        }

        // Check Lunch Time
        const lunchStartStr = this.timeService.toUtcTimeStr(designer.lunch_start as any);
        const lunchEndStr = this.timeService.toUtcTimeStr(designer.lunch_end as any);

        if (lunchStartStr && lunchEndStr) {
            if (resStartStr < lunchEndStr && resEndStr > lunchStartStr) {
                if (!force) {
                    return {
                        status: 'CONFLICT',
                        code: 'BLOCK_CONFLICT',
                        message: `해당 시간은 디자이너 점심시간(${lunchStartStr} ~ ${lunchEndStr})입니다. 계속 진행하시겠습니까?`,
                        details: { type: 'LUNCH', start: lunchStartStr, end: lunchEndStr }
                    };
                }
            }
        }

        return { status: 'PASS' };
    }
}

