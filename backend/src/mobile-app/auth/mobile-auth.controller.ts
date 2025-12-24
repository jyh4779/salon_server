import { Body, Controller, Post, UnauthorizedException, Request, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from '../../auth/auth.service'; // Reuse existing AuthService logic
import { UsersService } from '../../users/users.service';
import { CreateMobileUserDto } from './dto/create-mobile-user.dto';
import { FirebaseAuthGuard } from './guards/firebase-auth.guard';
import * as admin from 'firebase-admin';

@Controller('auth')
export class MobileAuthController {
    constructor(
        private authService: AuthService,
        private usersService: UsersService
    ) { }

    @Post('login/firebase')
    async login(@Body('firebaseToken') token: string) {
        try {
            // 1. Verify Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            const uid = decodedToken.uid;

            // 2. Find User by Firebase UID
            // UsersService needs a method findByFirebaseUid or similar.
            // Assuming we check 'firebase_uid' column.
            let user = await this.usersService.findByFirebaseUid(uid);

            if (!user) {
                // If not found by UID, try Phone (Account Merge logic)
                // BUT, 'phone' is inside the Firebase Token usually? Or provided?
                // Requirements say: User must SignUp if not found.
                // Login endpoint expects registered user.
                throw new UnauthorizedException('User not registered. Please sign up.');
            }

            // 3. Issue JWT
            const { accessToken, refreshToken, user: userData } = await this.authService.login(user);
            return {
                accessToken,
                refreshToken,
                user: {
                    id: Number(userData.user_id),
                    name: userData.name,
                    role: userData.role
                }
            };
        } catch (e) {
            console.error(e);
            throw new UnauthorizedException('Invalid Firebase Token or User not found');
        }
    }

    @Post('signup/mobile')
    async signup(@Body() dto: CreateMobileUserDto) {
        // 1. Verify Token
        const decodedToken = await admin.auth().verifyIdToken(dto.firebaseToken);
        const uid = decodedToken.uid;
        const { phone_number } = decodedToken; // Firebase Phone Auth provides this

        // 2. Check overlap
        // If phone number exists in DB (Offline customer) -> Merge
        // Logic handled in UsersService or here? Specs say "Logic: Case A/B".

        return this.usersService.createOrMergeMobileUser(uid, dto, phone_number);
    }
}
