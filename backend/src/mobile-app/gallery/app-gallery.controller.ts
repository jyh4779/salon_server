import { Controller, Get, Query } from '@nestjs/common';
import { VisitLogsService } from '../../visit-logs/visit-logs.service';

@Controller('gallery')
export class AppGalleryController {
    constructor(private visitLogsService: VisitLogsService) { }

    @Get('recent')
    async getRecentGallery() {
        return this.visitLogsService.findRecentGalleryItems(10);
    }
}
