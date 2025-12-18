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
            // Check for ADMIN or OWNER role
            if (user.role !== USERS_role.ADMIN && user.role !== USERS_role.OWNER) {
                return null;
            }
            const { password, ...result } = user;
            return result;
        }
        return null;
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
            console.log(`[DEBUG] AuthService.refresh called. Token (last 6): ...${refreshToken.slice(-6)}`);

            const payload = this.jwtService.verify(refreshToken, { secret: process.env.JWT_REFRESH_SECRET });
            console.log(`[DEBUG] Token verified. User ID (sub): ${payload.sub}`);

            const user = await this.usersService.getUserIfRefreshTokenMatching(refreshToken, payload.sub);
            if (!user) {
                console.error(`[DEBUG] getUserIfRefreshTokenMatching returned null. Validation failed.`);
                throw new UnauthorizedException();
            }
            console.log(`[DEBUG] User found and token matched. Role: ${user.role}`);

            // Role Check again just in case
            if (user.role !== USERS_role.ADMIN && user.role !== USERS_role.OWNER) {
                console.error(`[DEBUG] Invalid role: ${user.role}`);
                throw new UnauthorizedException('Access denied');
            }

            // Rotate tokens
            console.log(`[DEBUG] Rotating tokens...`);
            const newPayload = { email: user.email, sub: Number(user.user_id), role: user.role };
            const accessToken = this.jwtService.sign(newPayload, { expiresIn: '15m', secret: process.env.JWT_SECRET });
            const newRefreshToken = this.jwtService.sign(newPayload, { expiresIn: '7d', secret: process.env.JWT_REFRESH_SECRET });

            await this.usersService.setCurrentRefreshToken(newRefreshToken, Number(user.user_id));
            console.log(`[DEBUG] Tokens rotated and saved to DB.`);

            return {
                accessToken,
                refreshToken: newRefreshToken,
                user, // Return user info if needed
            };
        } catch (e) {
            console.error(`[DEBUG] AuthService.refresh Exception: ${e.message}`);
            throw new UnauthorizedException();
        }
    }
}
