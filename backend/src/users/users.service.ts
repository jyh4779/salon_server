import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USERS_role } from '@prisma/client';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { memo, ...userData } = data;

        // 1. 유저 생성
        const newUser = await this.prisma.uSERS.create({
            data: {
                ...userData,
                role: USERS_role.CUSTOMER,
                grade: 'NEW',
            },
        });

        // 2. 메모가 있다면 메모 생성 (작성자는 임시로 1번 관리자로 설정)
        if (memo) {
            await this.prisma.cUSTOMER_MEMOS.create({
                data: {
                    user_id: newUser.user_id,
                    writer_id: BigInt(1), // TODO: 실제 로그인한 관리자 ID로 변경 필요
                    shop_id: BigInt(1),   // TODO: 실제 샵 ID로 변경 필요
                    content: memo,
                },
            });
        }

        return newUser;
    }

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
