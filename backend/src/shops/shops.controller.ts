import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.shopsService.findOne(id);
    }

    @Patch(':id')
    async update(
        @Param('id', ParseIntPipe) id: number,
        @Body() updateShopDto: UpdateShopDto
    ) {
        return this.shopsService.update(id, updateShopDto);
    }
}
