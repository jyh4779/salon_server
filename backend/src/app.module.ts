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

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            load: [databaseConfig],
        }),
        PrismaModule,
        UsersModule,
        ShopsModule,
        DesignersModule,
        MenusModule,
        ReservationsModule,
        CustomersModule,
        SalesModule,
        AuthModule,
    ],
    providers: [],
})
export class AppModule { }
