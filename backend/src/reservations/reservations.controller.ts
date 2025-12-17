import { Controller, Get, Post, Body, Patch, Param, Delete, Query, ParseIntPipe } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { UpdateReservationDto } from './dto/update-reservation.dto';
import { CompleteReservationDto } from './dto/complete-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Get()
    async findAll(@Query() query: GetReservationsDto) {
        return this.reservationsService.findAll(query);
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.reservationsService.findOne(id);
    }

    @Post()
    async create(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationsService.create(createReservationDto);
    }

    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateReservationDto: UpdateReservationDto) {
        return this.reservationsService.update(id, updateReservationDto);
    }

    @Post(':id/complete')
    async complete(@Param('id', ParseIntPipe) id: number, @Body() completeReservationDto: CompleteReservationDto) {
        return this.reservationsService.complete(id, completeReservationDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.reservationsService.remove(id);
    }
}
