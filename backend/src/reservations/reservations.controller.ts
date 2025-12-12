import { Controller, Get, Query } from '@nestjs/common';
import { ReservationsService } from './reservations.service';
import { GetReservationsDto } from './dto/get-reservations.dto';

@Controller('reservations')
export class ReservationsController {
    constructor(private readonly reservationsService: ReservationsService) { }

    @Get()
    async findAll(@Query() query: GetReservationsDto) {
        return this.reservationsService.findAll(query);
    }
}
