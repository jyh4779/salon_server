import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { SalesService } from './sales.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';

@Controller('shops/:shopId/sales')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Get('daily')
    getDailySales(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query('date') date: string
    ) {
        // Default to today if no date provided
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.salesService.getDailySales(shopId, targetDate);
    }
    @Get('weekly')
    getWeeklySales(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query('date') date: string
    ) {
        // Default to today if no date provided
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.salesService.getWeeklySales(shopId, targetDate);
    }
}
