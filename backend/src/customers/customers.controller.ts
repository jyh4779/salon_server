import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';

@Controller('shops/:shopId/customers')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    async findAll(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query('search') search?: string
    ) {
        return this.customersService.findAll(shopId, search);
    }

    @Get(':id')
    async findOne(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.customersService.findOne(shopId, id);
    }

    @Post(':id/memos')
    async createMemo(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body('content') content: string,
        @Body('writerId') writerId: number // Ideally from JWT, but simplified for now
    ) {
        return this.customersService.createMemo(shopId, id, content, writerId || 1);
    }
}

