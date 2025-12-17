import { Controller, Post, UseGuards, Request, Body, Res, HttpCode, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) { }

    @Post('login')
    async login(@Body() body, @Res({ passthrough: true }) res: Response) {
        const user = await this.authService.validateUser(body.email, body.password);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials or permissions');
        }

        const { accessToken, refreshToken, user: userData } = await this.authService.login(user);

        // Set Refresh Token Cookie
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        // Return Access Token and User Info to client (Memory)
        return {
            accessToken,
            user: {
                id: Number(userData.user_id),
                name: userData.name,
                email: userData.email,
                role: userData.role,
            }
        };
    }

    @Post('logout')
    async logout(@Body() body, @Res({ passthrough: true }) res: Response) {
        if (body.userId) {
            await this.authService.logout(body.userId);
        }

        res.clearCookie('refresh_token', { path: '/api/auth/refresh' });
        return { message: 'Logged out' };
    }

    @Post('refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            throw new UnauthorizedException('Refresh token not found');
        }

        const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refresh(refreshToken);

        res.cookie('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/api/auth/refresh',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        return {
            accessToken,
            user: {
                id: Number(user.user_id),
                name: user.name,
                email: user.email,
                role: user.role,
            }
        };
    }
}
