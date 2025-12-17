import { Controller, Get, Query, Param, Post, Body } from '@nestjs/common';
import { CustomersService } from './customers.service';

@Controller('customers')
export class CustomersController {
    constructor(private readonly customersService: CustomersService) { }

    @Get()
    findAll(@Query('search') search?: string) {
        return this.customersService.findAll(search);
    }
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.customersService.findOne(+id);
    }

    @Post(':id/memos')
    createMemo(@Param('id') id: string, @Body('content') content: string) {
        return this.customersService.createMemo(+id, content);
    }
}
