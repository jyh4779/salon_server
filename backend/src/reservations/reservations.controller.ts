import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CompleteReservationDto } from './dto/complete-reservation.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';

@Controller('shops/:shopId/reservations')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Get()
    async findAll(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query() query: GetReservationsDto
    ) {
        return this.reservationsService.findAll(shopId, query);
    }

    @Get(':id')
    async findOne(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.reservationsService.findOne(shopId, id);
    }

    @Post()
    async create(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() createReservationDto: CreateReservationDto
    ) {
        createReservationDto.shop_id = shopId;
        return this.reservationsService.create(createReservationDto);
    }

    @Patch(':id')
    async update(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateReservationDto: UpdateReservationDto
    ) {
        return this.reservationsService.update(shopId, id, updateReservationDto);
    }

    @Post(':id/complete')
    async complete(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() completeReservationDto: CompleteReservationDto
    ) {
        return this.reservationsService.complete(shopId, id, completeReservationDto);
    }

    @Delete(':id')
    async remove(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.reservationsService.remove(shopId, id);
    }
}
