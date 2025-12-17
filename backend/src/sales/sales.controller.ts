import { Controller, Get, Query } from '@nestjs/common';
import { SalesService } from './sales.service';

@Controller('sales')
export class SalesController {
    constructor(private readonly salesService: SalesService) { }

    @Get('daily')
    getDailySales(@Query('date') date: string) {
        // Default to today if no date provided
        const targetDate = date || new Date().toISOString().split('T')[0];
        return this.salesService.getDailySales(targetDate);
    }
}
