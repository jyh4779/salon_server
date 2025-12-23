import { Controller, Get, Post, Body, Param, ParseIntPipe, UseGuards } from '@nestjs/common';
import { PrepaidService } from './prepaid.service';
import { CreateTicketDto, ChargePrepaidDto } from './dto/prepaid.dto';

@Controller('shops/:shopId')
export class PrepaidController {
    constructor(private readonly prepaidService: PrepaidService) { }

    @Post('prepaid-tickets')
    async createTicket(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() dto: CreateTicketDto,
    ) {
        return this.prepaidService.createTicket(shopId, dto);
    }

    @Get('prepaid-tickets')
    async getTickets(@Param('shopId', ParseIntPipe) shopId: number) {
        return this.prepaidService.getTickets(shopId);
    }

    @Get('customers/:userId/prepaid')
    async getBalance(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('userId', ParseIntPipe) userId: number,
    ) {
        return this.prepaidService.getBalance(shopId, userId);
    }

    @Post('customers/:userId/prepaid/charge')
    async chargePrepaid(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('userId', ParseIntPipe) userId: number,
        @Body() dto: ChargePrepaidDto,
    ) {
        return this.prepaidService.chargePrepaid(shopId, userId, dto);
    }
}
