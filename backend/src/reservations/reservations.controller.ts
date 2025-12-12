import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { GetReservationsDto } from './dto/get-reservations.dto';
import { CreateReservationDto } from './dto/create-reservation.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Get()
    async findAll(@Query() query: GetReservationsDto) {
        return this.reservationsService.findAll(query);
    }

    @Post()
    async create(@Body() createReservationDto: CreateReservationDto) {
        return this.reservationsService.create(createReservationDto);
    }
}
