import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Missing or invalid Authorization header');
        }

        const token = authHeader.split(' ')[1];

        try {
            // Decode and verify Firebase Token
            const decodedToken = await admin.auth().verifyIdToken(token);
            request.firebaseUser = decodedToken; // Attach to request
            return true;
        } catch (error) {
            console.error('Firebase Auth Error:', error);
            throw new UnauthorizedException('Invalid Firebase Token');
        }
    }
}
