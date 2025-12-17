import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ShopsService } from './shops.service';

@Controller('shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Get(':id')
    async findOne(@Param('id', ParseIntPipe) id: number) {
        return this.shopsService.findOne(id);
    }
}
