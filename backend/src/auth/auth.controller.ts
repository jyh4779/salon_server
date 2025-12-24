import { Controller, Post, UseGuards, Request, Body, Res, HttpCode, Get, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Response } from 'express';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

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
        const isProduction = process.env.NODE_ENV === 'production';
        res.cookie('refresh_token', refreshToken, {
            httpOnly: true,
            // In Dev (false), we need 'lax' or 'none' but for localhost cross-port, 'lax' is usually fine IF not relying on 3rd party.
            // But if it fails, 'secure: false' + 'sameSite: lax' works for localhost.
            // If we access via IP (168...), we might need None + Secure (but Secure requires HTTPS).
            // Let's try flexible approach: If NOT production, assume strictness can be lowered.
            secure: isProduction,
            sameSite: isProduction ? 'strict' : 'lax', // Lax is default, strictly safer.
            path: '/',
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

        res.clearCookie('refresh_token', { path: '/' });
        return { message: 'Logged out' };
    }

    @Post('refresh')
    async refresh(@Request() req, @Res({ passthrough: true }) res: Response) {
        const refreshToken = req.cookies['refresh_token'];
        if (!refreshToken) {
            // Return 200 with null to suppress browser console 401 error
            return { accessToken: null, user: null };
        }

        try {
            const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refresh(refreshToken);

            const isProduction = process.env.NODE_ENV === 'production';
            res.cookie('refresh_token', newRefreshToken, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'strict' : 'lax',
                path: '/',
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
        } catch (e) {
            // Token invalid or expired
            return { accessToken: null, user: null };
        }
    }
    @Post('verify-password')
    @UseGuards(JwtAuthGuard) // Assuming JwtAuthGuard exists and is globally available or imported?
    // Wait, imports at top: UseGuards is imported. JwtAuthGuard is NOT imported in the original file view!
    // I need to check imports. The original file view showed:
    // import { Controller, Post, UseGuards, Request, Body, Res, ... }
    // It did NOT show JwtAuthGuard import.
    // However, existing endpoints like 'login', 'logout', 'refresh' don't use UseGuards(JwtAuthGuard) explicitly?
    // 'refresh' uses @Request() req, but parses cookie.
    // 'login' is public.
    // 'verify-password' MUST be protected.
    // I need to import JwtAuthGuard.
    async verifyPassword(@Request() req, @Body() body) {
        const isValid = await this.authService.validatePassword(req.user.userId, body.password);
        if (!isValid) {
            throw new UnauthorizedException('Invalid password');
        }
        return { success: true };
    }
}
