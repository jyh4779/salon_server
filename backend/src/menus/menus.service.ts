import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenusService {
    constructor(private prisma: PrismaService) { }

    async findAll(shopId: number) {
        return this.prisma.mENUS.findMany({
            where: {
                shop_id: shopId,
                is_deleted: false,
            },
            orderBy: {
                price: 'asc',
            },
        });
    }
}
