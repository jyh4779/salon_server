import { Body, Controller, Get, Param, ParseIntPipe, Patch, UseGuards, Request } from '@nestjs/common';
import { ShopsService } from './shops.service';
import { UpdateShopDto } from './dto/update-shop.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) { }

    @Get('my-shop')
    @UseGuards(JwtAuthGuard)
    async findMyShop(@Request() req) {
        const userId = req.user.userId; // From JWT Strategy return value
        return this.shopsService.findMyShop(userId);
    }

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
