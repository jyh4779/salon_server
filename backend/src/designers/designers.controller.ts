import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { DesignersService } from './designers.service';
import { CreateDesignerDto } from './dto/create-designer.dto';
import { UpdateDesignerDto } from './dto/update-designer.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';

@Controller('shops/:shopId/designers')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class DesignersController {
    constructor(private readonly designersService: DesignersService) { }

    @Post()
    async create(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() createDesignerDto: CreateDesignerDto
    ) {
        return this.designersService.create(shopId, createDesignerDto);
    }

    @Get()
    async findAll(@Param('shopId', ParseIntPipe) shopId: number) {
        return this.designersService.findAll(shopId);
    }

    @Patch(':id')
    async update(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDesignerDto: UpdateDesignerDto
    ) {
        return this.designersService.update(id, updateDesignerDto);
    }
}
