import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USERS_role, USERS } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { memo, ...userData } = data;

        // 1. 유저 생성
        const newUser = await this.prisma.uSERS.create({
            data: {
                ...userData,
                password: userData.password ? await bcrypt.hash(userData.password, 10) : undefined,
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

    async findByEmail(email: string): Promise<USERS | undefined> {
        return this.prisma.uSERS.findUnique({
            where: { email },
        });
    }

    async setCurrentRefreshToken(refreshToken: string, userId: number) {
        const currentHashedRefreshToken = await bcrypt.hash(refreshToken, 10);
        await this.prisma.uSERS.update({
            where: { user_id: BigInt(userId) },
            data: {
                current_hashed_refresh_token: currentHashedRefreshToken,
            },
        });
    }

    async getUserIfRefreshTokenMatching(refreshToken: string, userId: number): Promise<USERS | null> {
        const user = await this.prisma.uSERS.findUnique({
            where: { user_id: BigInt(userId) },
        });

        if (!user || !user.current_hashed_refresh_token) return null;

        const isMatching = await bcrypt.compare(refreshToken, user.current_hashed_refresh_token);

        if (isMatching) {
            return user;
        }
        return null;
    }

    async removeRefreshToken(userId: number) {
        return this.prisma.uSERS.update({
            where: { user_id: BigInt(userId) },
            data: {
                current_hashed_refresh_token: null,
            },
        });
    }
}
