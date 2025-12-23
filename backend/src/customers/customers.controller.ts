import { Controller, Get, Post, Body, Param, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ShopAuthGuard } from '../common/guards/shop-auth.guard';
import { User } from '../common/decorators/user.decorator';

@Controller('shops/:shopId/customers')
@UseGuards(JwtAuthGuard, ShopAuthGuard)
export class CustomersController {
    constructor(
        private readonly customersService: CustomersService,
        private readonly usersService: UsersService,
    ) { }

    @Get()
    async findAll(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Query('search') search?: string
    ) {
        return this.customersService.findAll(shopId, search);
    }

    @Get(':id')
    async findOne(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number
    ) {
        return this.customersService.findOne(shopId, id);
    }

    @Post()
    async create(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Body() createUserDto: CreateUserDto,
        @User() user: any
    ) {
        // Pass shopId and writerId (user.sub) to UsersService
        return this.usersService.create(createUserDto, shopId, user.sub);
    }

    @Post(':id/memos')
    async createMemo(
        @Param('shopId', ParseIntPipe) shopId: number,
        @Param('id', ParseIntPipe) id: number,
        @Body('content') content: string,
        @Body('writerId') writerId: number, // Legacy param support
        @User() user: any
    ) {
        // Use JWT user id if available, fallback to writerId or 1
        const actualWriterId = user?.sub || writerId || 1;
        return this.customersService.createMemo(shopId, id, content, actualWriterId);
    }
}

