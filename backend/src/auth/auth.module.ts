import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';

@Module({
    imports: [
        UsersModule,
        PassportModule,
        JwtModule.register({}), // We register async/secret in Service or globally? 
        // Best practice is to use registerAsync with ConfigService, 
        // but for now we simply inject JwtService and use sign/verify manual or provide secret here.
        // However, Strategies need secret.
        // We will leave it empty here and handle secrets in Strategy/Service via process.env
    ],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
    controllers: [AuthController],
    exports: [AuthService],
})
export class AuthModule { }
