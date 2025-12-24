import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { ShopsService } from '../../shops/shops.service';
import { AppShopResponseDto } from './dto/app-shop-response.dto';
import { TimeService } from '../../common/time/time.service';

@Controller('shops')
export class AppShopsController {
    constructor(
        private shopsService: ShopsService,
        private timeService: TimeService
    ) { }

    @Get()
    async findAll(@Query('page') page = 1, @Query('limit') limit = 10, @Query('search') search?: string) {
        // Reuse ShopsService.findAll logic but map to safe DTO
        // ShopsService might return all fields. Check implementation.
        // Assuming ShopsService.findAll returns array of entities.

        // TODO: Pagination support in ShopsService?
        // Existing ShopsService.findAll currently doesn't support pagination, need to check.
        // If not, we might need to add it or do in-memory (not ideal but quick).
        // Let's assume reuse for now.
        const shops = await this.shopsService.findAll(); // It returns Promise<SHOPS[]>

        // Filter by search if needed (or Service does it)
        let filtered = shops;
        if (search) {
            filtered = shops.filter(s => s.name.includes(search));
        }

        // Pagination
        const start = (page - 1) * limit;
        const paged = filtered.slice(start, start + Number(limit));

        return paged.map(shop => this.toDto(shop));
    }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const shop = await this.shopsService.findOne(id);
        if (!shop) return null;
        return this.toDto(shop);
    }

    private toDto(shop: any): AppShopResponseDto {
        return {
            shop_id: Number(shop.shop_id),
            name: shop.name,
            tel: shop.tel,
            address: shop.address,
            open_time: this.timeService.toUtcTimeStr(shop.open_time),
            close_time: this.timeService.toUtcTimeStr(shop.close_time),
            closed_days: shop.closed_days
        };
    }
}
