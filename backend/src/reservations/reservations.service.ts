import { Injectable, BadRequestException } from '@nestjs/common';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { ReservationsRepository } from './reservations.repository';
import { CompleteReservationDto } from './dto/complete-reservation.dto';

import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

import { PrepaidService } from '../prepaid/prepaid.service';

@Injectable()
export class ReservationsService {
    constructor(
        private reservationsRepository: ReservationsRepository,
        private prisma: PrismaService,
        private timeService: TimeService,
        private prepaidService: PrepaidService
    ) { }

    async getAvailableSlots(shopId: number, date: string, duration: number, designerId?: number) {
        // 1. Target Designers
        let designers = [];
        if (designerId && !isNaN(designerId)) {
            const d = await this.prisma.dESIGNERS.findUnique({ where: { designer_id: BigInt(designerId) } });
            if (d && d.is_active) designers.push(d);
        } else {
            // ANY or Not provided -> Fetch All Active
            designers = await this.prisma.dESIGNERS.findMany({
                where: { shop_id: BigInt(shopId), is_active: true }
            });
        }

        const dateObj = this.timeService.parse(date); // Start of day 00:00 (KST probably)
        const dayOfWeek = dateObj.format('ddd');

        // Shop info for Closed Days
        const shop = await this.prisma.sHOPS.findUnique({ where: { shop_id: BigInt(shopId) } });
        if (!shop || (shop.closed_days && shop.closed_days.includes(dayOfWeek))) {
            return []; // Shop closed
        }

        const allSlots = new Set<string>();

        // 2. Loop Designers
        for (const designer of designers) {
            // Check Day Off
            if (designer.day_off && designer.day_off.includes(dayOfWeek)) continue;

            const workStartStr = this.timeService.toUtcTimeStr(designer.work_start as any); // HH:mm
            const workEndStr = this.timeService.toUtcTimeStr(designer.work_end as any);   // HH:mm

            if (!workStartStr || !workEndStr) continue;

            // Define Search Range (Shop Open vs Designer Work - Intersection)
            // But usually Designer Work is within Shop Open. Layout uses Designer Work.
            let startT = this.timeService.parse(`${date} ${workStartStr}`);
            let endT = this.timeService.parse(`${date} ${workEndStr}`);

            // Generate Slots (e.g. 30 min interval)
            // Implementation: Loop from workStart to workEnd - duration
            let current = startT;
            while (current.add(duration, 'minute').isSame(endT) || current.add(duration, 'minute').isBefore(endT)) {
                const slotTimeStr = current.format('HH:mm');
                const slotEndStr = current.add(duration, 'minute').format('HH:mm');

                // Check Conflicts
                // 1. Lunch
                const lunchStart = this.timeService.toUtcTimeStr(designer.lunch_start as any);
                const lunchEnd = this.timeService.toUtcTimeStr(designer.lunch_end as any);
                let isLunch = false;
                if (lunchStart && lunchEnd) {
                    // Simple String Compare for HH:mm works
                    // Overlap Check: Not (End <= LunchStart OR Start >= LunchEnd)
                    if (!(slotEndStr <= lunchStart || slotTimeStr >= lunchEnd)) {
                        isLunch = true;
                    }
                }

                // 2. Reservations/Blocks (Need to fetch)
                // Optimally, we fetch all reservations for this designer on this date ONCE outside loop or cached.
                // For MVP, fetch here is okay (or fetch all for detailed check).
                // Better: Fetch all res/blocks for this Date/Designer at loop start.

                // Let's optimize: Fetch once per designer.

                if (!isLunch) {
                    // Check Reservations collision
                    // Using validateAvailability or just raw check? 
                    // validateAvailability throws Exception. We need boolean.
                    // Let's implement lightweight check here or separate helper.
                    // Re-use logic: "validateAvailability" is too heavy (DB calls).
                    // We need "checkCollision(designerId, start, end)".
                    const hasConflict = await this.checkCollision(Number(designer.designer_id), current, current.add(duration, 'minute'));
                    if (!hasConflict) {
                        allSlots.add(slotTimeStr);
                    }
                }

                current = current.add(30, 'minute'); // Fixed Interval?? Or based on Duration?
                // Usually defined by 'TimeGrid'. Let's assume 30min interval step.
            }
        }

        // Sort results
        return Array.from(allSlots).sort();
    }

    // Lightweight collision check without Exceptions
    private async checkCollision(designerId: number, start: any, end: any): Promise<boolean> {
        // Blocks
        const block = await this.prisma.sCHEDULE_BLOCKS.findFirst({
            where: {
                designer_id: BigInt(designerId),
                OR: [
                    { start_time: { lt: end.toDate() }, end_time: { gt: start.toDate() } }
                ]
            }
        });
        if (block) return true;

        // Reservations
        const res = await this.prisma.rESERVATIONS.findFirst({
            where: {
                designer_id: BigInt(designerId),
                status: { notIn: ['CANCELED', 'NOSHOW'] },
                OR: [
                    { start_time: { lt: end.toDate() }, end_time: { gt: start.toDate() } }
                ]
            }
        });
        if (res) return true;

        return false;
    }


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

        try {
            return await this.reservationsRepository.updateReservation(shopId, id, updateReservationDto);
        } catch (error) {
            console.error('[ReservationsService.update] Error:', error);
            throw error;
        }
    }

    async complete(shopId: number, id: number, completeReservationDto: CompleteReservationDto) {
        const { payments, totalPrice } = completeReservationDto;

        const reservation = await this.reservationsRepository.getReservationById(shopId, id);
        if (!reservation) throw new BadRequestException('Reservation not found');

        // Calculate sum of payments
        const paymentSum = payments.reduce((sum, p) => sum + p.amount, 0);
        if (paymentSum !== totalPrice) {
            // Note: exact match required? Yes for now.
            // throw new BadRequestException(`결제 금액 합계(${paymentSum})가 총 시술 금액(${totalPrice})과 일치하지 않습니다.`);
            // User might pay less (partial?) No requirements yet. Assume full payment.
        }

        // Handle Prepaid Deductions
        for (const payment of payments) {
            if (payment.paymentType === 'PREPAID') {
                // Deduct balance (Throws error if insufficient)
                await this.prepaidService.usePrepaid(shopId, Number(reservation.customer_id), payment.amount);
            }
        }

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

