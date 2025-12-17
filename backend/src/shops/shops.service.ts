import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: number) {
        // Convert to BigInt for Prisma
        const shop = await this.prisma.sHOPS.findUnique({
            where: { shop_id: BigInt(id) },
        });
        // Console log removed for cleaner output
        // console.log(`[Backend] ShopsService.findOne(${id}) result:`, JSON.stringify(shop, null, 2));

        // Serialize BigInt for JSON response if needed (though NestJS might handle it with interceptor, let's be safe or just return object)
        // If shop is null, return null
        if (!shop) return null;

        // Manually format Time objects if they come back as Date objects from Prisma (which they do for @db.Time)
        // We might want to format them to strings "HH:mm" for frontend
        return {
            ...shop,
            shop_id: shop.shop_id.toString(),
            owner_id: shop.owner_id.toString(),
            open_time: shop.open_time ? shop.open_time.toISOString().split('T')[1].substring(0, 5) : null,
            close_time: shop.close_time ? shop.close_time.toISOString().split('T')[1].substring(0, 5) : null,
        };
    }

    async update(id: number, data: any) {
        // Parse time strings to Date objects if provided
        // Input: "10:00" -> Date object for 1970-01-01T10:00:00
        const updateData: any = { ...data };
        console.log(`[Backend] ShopsService.update(${id}) payload:`, JSON.stringify(data, null, 2));

        if (data.open_time) {
            updateData.open_time = new Date(`1970-01-01T${data.open_time}:00Z`); // Simple parsing, adjust TZ if needed
        }
        if (data.close_time) {
            updateData.close_time = new Date(`1970-01-01T${data.close_time}:00Z`);
        }

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
