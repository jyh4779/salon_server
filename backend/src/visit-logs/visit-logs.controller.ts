import { Controller, Get, Post, Body, Param, Query, DefaultValuePipe, ParseIntPipe } from '@nestjs/common';
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
    @Get('customer/:id')
    findByCustomer(
        @Param('id') id: string,
        @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
        @Query('limit', new DefaultValuePipe(9), ParseIntPipe) limit: number,
    ) {
        return this.visitLogsService.findByCustomer(+id, page, limit);
    }
}
