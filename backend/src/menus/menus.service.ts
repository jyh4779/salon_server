import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenusService {
    constructor(private prisma: PrismaService) { }

    async findAll(shopId: number) {
        const menus = await this.prisma.mENUS.findMany({
            where: {
                shop_id: BigInt(shopId),
                is_deleted: false,
            },
            orderBy: [
                { sort_order: 'asc' },
                { price: 'asc' },
            ],
        });

        return menus.map(m => ({
            ...m,
            menu_id: m.menu_id.toString(),
            shop_id: m.shop_id.toString(),
            type: m.type,
            sort_order: m.sort_order,
        }));
    }

    async create(shopId: number, data: any) {
        const menu = await this.prisma.mENUS.create({
            data: {
                shop_id: BigInt(shopId),
                category: data.category || '기타',
                name: data.name,
                price: data.price,
                duration: data.duration,
                description: data.description || '',
                type: data.type || 'MENU',
                sort_order: data.sort_order || 0,
            }
        });
        return {
            ...menu,
            menu_id: menu.menu_id.toString(),
            shop_id: menu.shop_id.toString(),
            type: menu.type,
            sort_order: menu.sort_order
        };
    }

    async update(menuId: number, data: any) {
        const menu = await this.prisma.mENUS.update({
            where: { menu_id: BigInt(menuId) },
            data: data
        });
        return {
            ...menu,
            menu_id: menu.menu_id.toString(),
            shop_id: menu.shop_id.toString(),
            type: menu.type,
            sort_order: menu.sort_order
        };
    }

    async remove(menuId: number) {
        const menu = await this.prisma.mENUS.update({
            where: { menu_id: BigInt(menuId) },
            data: { is_deleted: true }
        });
        return {
            ...menu,
            menu_id: menu.menu_id.toString(),
            shop_id: menu.shop_id.toString(),
            type: menu.type,
            sort_order: menu.sort_order
        };
    }
}
