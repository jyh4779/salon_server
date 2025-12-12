import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USERS_role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async findAll(search?: string) {
        const whereCondition: any = {
            role: USERS_role.CUSTOMER, // 고객만 검색
        };

        if (search) {
            whereCondition.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
            ];
        }

        return this.prisma.uSERS.findMany({
            where: whereCondition,
            select: {
                user_id: true,
                name: true,
                phone: true,
            },
            take: 20, // 검색 결과 제한
            orderBy: {
                name: 'asc',
            },
        });
    }
}
