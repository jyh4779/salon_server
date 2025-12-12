import { Controller, Get, Query } from '@nestjs/common';
import { DesignersService } from './designers.service';

@Controller('designers')
export class DesignersController {
    constructor(private readonly designersService: DesignersService) { }

    @Get()
    async findAll(@Query('shop_id') shopId: string) {
        // shopId defaulting to 1 for now if not provided, or handle validation
        const id = shopId ? parseInt(shopId, 10) : 1;
        return this.designersService.findAll(id);
    }
}
