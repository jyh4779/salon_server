import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { USERS_role, USERS } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any) {
        const { memo, ...userData } = data;

        // Phone sanitization
        if (userData.phone) {
            userData.phone = userData.phone.replace(/-/g, '');
        }

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
            const cleanSearch = search.replace(/-/g, '');
            whereCondition.OR = [
                { name: { contains: search } },
                { phone: { contains: cleanSearch } },
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
        // Force fresh read using Raw Query to bypass any potential Prisma caching/stale connection state
        // Force fresh read using Locking Query (FOR SHARE) to bypass any MySQL MVCC snapshot
        // This ensures we read the latest committed data even in REPEATABLE READ isolation
        const users = await this.prisma.$queryRaw<USERS[]>`SELECT * FROM USERS WHERE user_id = ${userId} LOCK IN SHARE MODE`;
        const user = users[0];

        if (!user) return null;
        if (!user.current_hashed_refresh_token) return null;

        const isMatching = await bcrypt.compare(refreshToken, user.current_hashed_refresh_token);

        console.log('--- [IMPOSSIBLE MATCH DEBUG START] ---');
        console.log(`1. Incoming Token (Last 10): ...${refreshToken.slice(-10)}`);
        console.log(`2. DB Stored Hash (First 10): ${user.current_hashed_refresh_token.substring(0, 10)}...`);
        console.log(`3. Compare Result: ${isMatching}`);

        // Sanity Check: Is stored hash actually a hash?
        const isHash = user.current_hashed_refresh_token.startsWith('$2b$');
        console.log(`4. Is DB Value a Bcrypt Hash?: ${isHash}`);

        console.log('--- [IMPOSSIBLE MATCH DEBUG END] ---');

        if (!isMatching) {
            console.log(`[TRAP] User ${userId} Refresh Failed.`);
        } else {
            console.log(`[TRAP] User ${userId} Refresh SUCCESS.`);
        }

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
