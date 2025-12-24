import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import databaseConfig from './config/database.config';
import { PrismaModule } from './prisma/prisma.module';
import { ReservationsModule } from './reservations/reservations.module';
import { UsersModule } from './users/users.module';
import { DesignersModule } from './designers/designers.module';
import { MenusModule } from './menus/menus.module';
import { ShopsModule } from './shops/shops.module';
import { CustomersModule } from './customers/customers.module';
import { SalesModule } from './sales/sales.module';
import { AuthModule } from './auth/auth.module';
import { UploadsModule } from './uploads/uploads.module';
import { VisitLogsModule } from './visit-logs/visit-logs.module';
import { PrepaidModule } from './prepaid/prepaid.module';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UPLOAD_ROOT } from './config/upload.config';

import { TimeModule } from './common/time/time.module';

import { MobileAppModule } from './mobile-app/mobile-app.module';
import { RouterModule } from '@nestjs/core';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        TimeModule,
        PrismaModule,
        UsersModule,
        ShopsModule,
        DesignersModule,
        MenusModule,
        ReservationsModule,
        CustomersModule,
        SalesModule,
        AuthModule,
        UploadsModule,
        VisitLogsModule,
        PrepaidModule,
        MobileAppModule,
        RouterModule.register([
            {
                path: 'api/app',
                module: MobileAppModule,
            },
        ]),
        ServeStaticModule.forRoot({
            rootPath: UPLOAD_ROOT,
            serveRoot: '/uploads',
        }),
    ],
    providers: [],
})
export class AppModule { }
