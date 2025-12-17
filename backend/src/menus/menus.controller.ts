import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

@Controller('menus')
export class MenusController {
    constructor(private readonly menusService: MenusService) { }

    @Get()
    async findAll(@Query('shop_id') shopId: string) {
        const id = shopId ? parseInt(shopId, 10) : 1;
        return this.menusService.findAll(id);
    }

    @Post()
    async create(
        @Query('shop_id') shopId: string,
        @Body() createMenuDto: CreateMenuDto
    ) {
        const id = shopId ? parseInt(shopId, 10) : 1;
        return this.menusService.create(id, createMenuDto);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMenuDto: UpdateMenuDto
    ) {
        return this.menusService.update(id, updateMenuDto);
    }

    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        return this.menusService.remove(id);
    }
}
