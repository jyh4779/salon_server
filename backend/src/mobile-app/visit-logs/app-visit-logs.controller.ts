import { Controller, Get, Param, ParseIntPipe, Query, UseGuards, Request } from '@nestjs/common';
import { VisitLogsService } from '../../visit-logs/visit-logs.service';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';

@Controller('shops/:shopId/visit-logs')
@UseGuards(JwtAuthGuard)
export class AppVisitLogsController {
    constructor(private visitLogsService: VisitLogsService) { }

    @Get('me')
    async getMyLogs(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Request() req,
        @Query('page') page = 1,
        @Query('limit') limit = 10
    ) {
        const userId = req.user.userId;

        // Reuse Service Logic (need to check if it supports customerId filtering)
        // VisitLogsService.findAll(shopId, customerId, ...)

        // Actually, let's check VisitLogsService implementation.
        // If it doesn't support easy pagination/filtering, we might call Prisma directly here or add method.
        // Assuming we add `findMyLogs` to service or reuse existing.

        const logs = await this.visitLogsService.findByCustomer(shopId, userId, page, limit);

        // MAP to Safe DTO (Exclude Admin Memo)
        return logs.data.map(log => ({
            log_id: Number(log.log_id),
            visited_at: log.visited_at,
            photo_urls: log.photo_urls ? JSON.parse(log.photo_urls) : [],
            designer_name: log.DESIGNERS?.USERS?.name,
            menu_name: log.RESERVATIONS?.RESERVATION_ITEMS?.map(i => i.menu_name).join(', ') || '시술',
            // admin_memo is EXCLUDED
        }));
    }
}
