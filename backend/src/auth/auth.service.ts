import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { USERS_role } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findByEmail(email);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            // Check for authentication vs authorization:
            // validateUser is usually for Login.
            // Role check here might block generic login, but that's intended? 
            // The existing code restricts Login to ADMIN/OWNER. Correct.
            if (user.role !== USERS_role.ADMIN && user.role !== USERS_role.OWNER) {
                return null;
            }
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async validatePassword(userId: number, pass: string): Promise<boolean> {
        const user = await this.usersService.findById(userId);
        if (user && user.password && (await bcrypt.compare(pass, user.password))) {
            return true;
        }
        return false;
    }

    async login(user: any) {
        // user is what validateUser returned (BigInt fields need handling if present, but user_id is likely BigInt)
        // Payload for JWT
        const payload = { email: user.email, sub: Number(user.user_id), role: user.role };

        const accessToken = this.jwtService.sign(payload, { expiresIn: '15m', secret: process.env.JWT_SECRET });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET });

        await this.usersService.setCurrentRefreshToken(refreshToken, Number(user.user_id));

        return {
            accessToken,
            refreshToken,
            user,
        };
    }

    async logout(userId: number) {
        return this.usersService.removeRefreshToken(userId);
    }

    async refresh(refreshToken: string) {
        try {
            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });

            const user = await this.usersService.getUserIfRefreshTokenMatching(refreshToken, payload.sub);

            if (!user) {
                throw new UnauthorizedException();
            }

            // Role Check again just in case
            if (user.role !== USERS_role.ADMIN && user.role !== USERS_role.OWNER) {
                throw new UnauthorizedException('Access denied');
            }

            // Rotate tokens
            const newPayload = { email: user.email, sub: Number(user.user_id), role: user.role };
            const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m', secret: process.env.JWT_SECRET });
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET });

            await this.usersService.setCurrentRefreshToken(newRefreshToken, Number(user.user_id));

            return {
                accessToken,
                refreshToken: newRefreshToken,
                user, // Return user info if needed
            };
        } catch (e) {
            throw new UnauthorizedException();
        }
    }
}
