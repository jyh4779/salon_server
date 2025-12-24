import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ShopsModule } from '../shops/shops.module';
import { ReservationsModule } from '../reservations/reservations.module';
import { DesignersModule } from '../designers/designers.module';
import { MenusModule } from '../menus/menus.module';
import { VisitLogsModule } from '../visit-logs/visit-logs.module';

import { MobileAuthController } from './auth/mobile-auth.controller';
import { AppShopsController } from './shops/app-shops.controller';
import { AppReservationsController } from './reservations/app-reservations.controller';

@Module({
    imports: [
        AuthModule,
        UsersModule,
        ShopsModule,
        ReservationsModule,
        DesignersModule,
        MenusModule,
        VisitLogsModule
    ],
    controllers: [
        MobileAuthController,
        AppShopsController,
        AppReservationsController
    ],
    providers: [],
})
export class MobileAppModule { }
