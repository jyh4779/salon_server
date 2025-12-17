import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { DesignersService } from './designers.service';
import { CreateDesignerDto } from './dto/create-designer.dto';
import { UpdateDesignerDto } from './dto/update-designer.dto';

@Controller('designers')
export class DesignersController {
    constructor(private readonly designersService: DesignersService) { }

    @Post()
    async create(
        @Body() createDesignerDto: CreateDesignerDto,
        @Query('shop_id') shopId: string
    ) {
        const id = shopId ? parseInt(shopId, 10) : 1;
        return this.designersService.create(id, createDesignerDto);
    }

    @Get()
    async findAll(@Query('shop_id') shopId: string) {
        // shopId defaulting to 1 for now if not provided, or handle validation
        const id = shopId ? parseInt(shopId, 10) : 1;
        return this.designersService.findAll(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateDesignerDto: UpdateDesignerDto
    ) {
        return this.designersService.update(id, updateDesignerDto);
    }
}
