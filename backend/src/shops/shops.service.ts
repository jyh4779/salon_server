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

        if (!shop) return null;

        return this.mapToDto(shop);
    }

    async findMyShop(ownerId: number) {
        console.log(`[ShopsService] findMyShop calling with ownerId: ${ownerId} (${typeof ownerId})`);
        const shop = await this.prisma.sHOPS.findFirst({
            where: { owner_id: BigInt(ownerId) },
        });
        console.log(`[ShopsService] findMyShop result:`, shop ? `Shop ID ${shop.shop_id}` : 'null');

        if (!shop) return null;

        return this.mapToDto(shop);
    }

    private mapToDto(shop: any) {
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
        if (data.open_time) {
            updateData.open_time = this.timeService.parseUtcTime(data.open_time);
        }
        if (data.close_time) {
            updateData.close_time = this.timeService.parseUtcTime(data.close_time);
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
