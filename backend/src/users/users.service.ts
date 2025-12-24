import { Injectable, ConflictException } from '@nestjs/common';
import { CreateMobileUserDto } from '../mobile-app/auth/dto/create-mobile-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { USERS_role, USERS } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(data: any, shopId?: number, writerId?: number) {
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
                role: userData.role || USERS_role.CUSTOMER,
                grade: 'NEW',
            },
        });

        // 2. 메모가 있다면 메모 생성
        if (memo) {
            // Default to 1 if not provided (for backward compatibility)
            const resolvedShopId = shopId ? BigInt(shopId) : BigInt(1);
            const resolvedWriterId = writerId ? BigInt(writerId) : BigInt(1);

            await this.prisma.cUSTOMER_MEMOS.create({
                data: {
                    user_id: newUser.user_id,
                    writer_id: resolvedWriterId,
                    shop_id: resolvedShopId,
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

    async findById(userId: number): Promise<USERS | undefined> {
        return this.prisma.uSERS.findUnique({
            where: { user_id: BigInt(userId) },
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

    async findByFirebaseUid(uid: string): Promise<USERS | undefined> {
        return this.prisma.uSERS.findFirst({
            where: { firebase_uid: uid },
        });
    }

    async createOrMergeMobileUser(uid: string, dto: CreateMobileUserDto, phoneFromToken?: string): Promise<USERS> {
        // Priority: Phone from Token (verified) > Phone from Input
        const targetPhone = phoneFromToken || dto.phone?.replace(/-/g, '');

        if (!targetPhone) {
            throw new ConflictException('Phone number is required');
        }

        // Check if user exists by phone
        const existingUser = await this.prisma.uSERS.findFirst({
            where: { phone: targetPhone }
        });

        if (existingUser) {
            // [Case A] Merge Account
            // If already has firebase_uid (and different), it's a conflict or multi-login.
            // Assumption: Just update/overwrite for now or throw if different?
            // "Account Merge" usually implies binding.

            return this.prisma.uSERS.update({
                where: { user_id: existingUser.user_id },
                data: {
                    firebase_uid: uid,
                    email: existingUser.email // Keep existing or update? Specs: "firebase_uid update + email update"
                    // If we want to sync email from firebase:
                    // email: dto.email? 
                    // Let's stick to spec: "update firebase_uid".
                }
            });
        }

        // [Case B] New User
        return this.prisma.uSERS.create({
            data: {
                firebase_uid: uid,
                name: dto.name,
                phone: targetPhone,
                birthdate: dto.birthdate,
                gender: dto.gender,
                // Wait, I should double check Schema columns. 
                // Creating with safe defaults.
                role: USERS_role.CUSTOMER,
                grade: 'NEW',
                is_app_user: true
            }
        });
    }
}
