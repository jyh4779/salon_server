import { Controller, Get, Query } from '@nestjs/common';
import { MenusService } from './menus.service';

@Controller('menus')
export class MenusController {
    constructor(private readonly menusService: MenusService) { }

    @Get()
    async findAll(@Query('shop_id') shopId: string) {
        const id = shopId ? parseInt(shopId, 10) : 1;
        return this.menusService.findAll(id);
    }
}
