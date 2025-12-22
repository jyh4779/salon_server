import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { VisitLogsService } from './visit-logs.service';
import { CreateVisitLogDto } from './dto/create-visit-log.dto';

@Controller('visit-logs')
export class VisitLogsController {
    constructor(private readonly visitLogsService: VisitLogsService) { }

    @Post()
    create(@Body() createVisitLogDto: CreateVisitLogDto) {
        return this.visitLogsService.create(createVisitLogDto);
    }

    @Get('reservation/:id')
    findByReservation(@Param('id') id: string) {
        return this.visitLogsService.findByReservation(+id);
    }

    @Get('customer/:id')
    findByCustomer(@Param('id') id: string) {
        return this.visitLogsService.findByCustomer(+id);
    }
}
