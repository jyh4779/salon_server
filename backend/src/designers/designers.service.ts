import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DesignersService {
    constructor(private prisma: PrismaService) { }

    async findAll(shopId: number) {
        return this.prisma.dESIGNERS.findMany({
            where: {
                shop_id: shopId,
                is_active: true,
            },
            include: {
                USERS: {
                    select: {
                        name: true,
                    },
                },
            },
        });
    }
}
