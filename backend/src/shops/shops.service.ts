import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

@Injectable()
export class ShopsService {
    constructor(
        private prisma: PrismaService,
        private timeService: TimeService
    ) { }

    async findOne(id: number) {
        // Convert to BigInt for Prisma
        const shop = await this.prisma.sHOPS.findUnique({
            where: { shop_id: BigInt(id) },
        });

        // Serialize BigInt for JSON response if needed
        if (!shop) return null;

        return {
            ...shop,
            shop_id: shop.shop_id.toString(),
            owner_id: shop.owner_id.toString(),
            open_time: this.timeService.toUtcTimeStr(shop.open_time),
            close_time: this.timeService.toUtcTimeStr(shop.close_time),
        };
    }

    async update(id: number, data: any) {
        const updateData: any = { ...data };
        console.log(`[Backend] ShopsService.update(${id}) payload:`, JSON.stringify(data, null, 2));

        if (data.open_time) {
            updateData.open_time = this.timeService.parseUtcTime(data.open_time);
        }
        if (data.close_time) {
            updateData.close_time = this.timeService.parseUtcTime(data.close_time);
        }
        // Wait, if I change this to TimeService KST, I might break ReservationsService validAvailability?
        // ReservationsService logic:
        // const openTimeStr = this.timeService.toTimeStr(shop.open_time);
        // TimeService.toTimeStr -> parse(date).format('HH:mm') -> dayjs(date).tz('Asia/Seoul')
        // toTimeStr -> 1970-01-01T19:00:00+09:00 (19:00 KST).
        // ERROR!

        // Previous ReservationsService:
        // dayjs(shop.open_time).utc().format('HH:mm') -> 10:00.

        // My new ReservationsService:
        // toTimeStr -> parse(date) -> dayjs(date).tz('Asia/Seoul')
        // This shifts UTC to KST.

        // PROBLEM: DB stores Time as UTC Date (1970-01-01).
        // If we treat it as KST, we shift it.
        // We should treat DB Time columns strictly as UTC?
        // Or we should update TimeService to handle "Time Only" columns specially?

        // Let's modify TimeService.toTimeStr to optionally accept "isUTC" or handle this.
        // OR better: in ShopsService and DesignersService, save as KST?
        // If I save "10:00 KST" -> `1970-01-01T01:00:00Z`.
        // Then `toTimeStr` (KST) -> `10:00`. Correct.

        // So I should save times as KST-converted-to-UTC in DB?
        // Previous code saved `10:00Z` (10:00 UTC).
        // If I change saving logic, I must migrate existing data.
        // Avoiding migration is better.
        // Existing Data: 10:00 UTC.
        // New ReservationsService: `timeService.toTimeStr`.

        // Let's check `toTimeStr` implementation in `TimeService`.
        // parse(date) -> dayjs(date).tz('Asia/Seoul').
        // If date is `...T10:00:00Z`, it becomes `19:00 KST`.
        // So `toTimeStr` returns "19:00".
        // This conficts with "10:00".

        // Major Issue: The previous code treated DB Time columns as "Value Only" by formatting as UTC.
        // But `TimeService` enforces KST.

        // Solution:
        // Update `TimeService` to add `toTimeStrFromUTC(date)` or similar helper.
        // Or update `ReservationsService` to NOT use `TimeService` for DB Time columns? No, we want consistency.

        // Best approach:
        // Add `formatUtcTime(date)` to `TimeService` which does `dayjs(date).utc().format('HH:mm')`.
        // This preserves the "Raw Time Value" stored in DB if it was stored as UTC.

        // Let's pause editing `ShopsService` and update `TimeService` first.

        return; // Abort this tool call


        const shop = await this.prisma.sHOPS.update({
            where: { shop_id: BigInt(id) },
            data: updateData,
        });

        return {
            ...shop,
            shop_id: shop.shop_id.toString(),
            owner_id: shop.owner_id.toString(),
            open_time: shop.open_time ? shop.open_time.toISOString().split('T')[1].substring(0, 5) : null,
            close_time: shop.close_time ? shop.close_time.toISOString().split('T')[1].substring(0, 5) : null,
        };
    }
}
