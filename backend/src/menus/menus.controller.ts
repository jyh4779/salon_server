import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { MenusService } from './menus.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';

@Controller('shops/:shopId/menus')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class MenusController {
    constructor(private readonly menusService: MenusService) { }

    @Get()
    async findAll(@Param('shopId', ParseIntPipe) shopId: number) {
        return this.menusService.findAll(shopId);
    }

    @Post()
    async create(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() createMenuDto: CreateMenuDto
    ) {
        return this.menusService.create(shopId, createMenuDto);
    }

    @Patch(':id')
    async update(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateMenuDto: UpdateMenuDto
    ) {
        return this.menusService.update(shopId, id, updateMenuDto);
    }

    @Delete(':id')
    async remove(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.menusService.remove(shopId, id);
    }
}
