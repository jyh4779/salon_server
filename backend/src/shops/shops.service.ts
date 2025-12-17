import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShopsService {
    constructor(private prisma: PrismaService) { }

    async findOne(id: number) {
        const shop = await this.prisma.sHOPS.findUnique({
            where: { shop_id: id },
        });
        console.log(`[Backend] ShopsService.findOne(${id}) result:`, JSON.stringify(shop, null, 2));
        return shop;
    }
}
