import { Controller, Get, Post, Body, Param, Query, DefaultValuePipe, ParseIntPipe, UseGuards } from '@nestjs/common';
import { VisitLogsService } from './visit-logs.service';
import { CreateVisitLogDto } from './dto/create-visit-log.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';

@Controller('shops/:shopId/visit-logs')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class VisitLogsController {
    constructor(private readonly visitLogsService: VisitLogsService) { }

    @Post()
    async create(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() createVisitLogDto: CreateVisitLogDto
    ) {
        return this.visitLogsService.create(shopId, createVisitLogDto);
    }

    @Get('reservation/:id')
    async findByReservation(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.visitLogsService.findByReservation(shopId, id);
    }

    @Get('customer/:customerId')
    async findByCustomer(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('customerId', ParseIntPipe) customerId: number,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number,
    ) {
        return this.visitLogsService.findByCustomer(shopId, customerId, page, limit);
    }
}
