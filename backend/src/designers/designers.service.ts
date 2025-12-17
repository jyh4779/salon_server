import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DesignersService {
    constructor(private prisma: PrismaService) { }

    async findAll(shopId: number) {
        const designers = await this.prisma.dESIGNERS.findMany({
            where: {
                shop_id: BigInt(shopId), // Ensure BigInt
                // removed is_active: true to show all in settings
            },
            include: {
                USERS: {
                    select: {
                        name: true,
                        phone: true,
                    },
                },
            },
        });

        return designers.map(d => ({
            ...d,
            designer_id: d.designer_id.toString(),
            user_id: d.user_id.toString(),
            shop_id: d.shop_id.toString(),
            work_start: d.work_start ? d.work_start.toISOString().split('T')[1].substring(0, 5) : null,
            work_end: d.work_end ? d.work_end.toISOString().split('T')[1].substring(0, 5) : null,
            lunch_start: d.lunch_start ? d.lunch_start.toISOString().split('T')[1].substring(0, 5) : null,
            lunch_end: d.lunch_end ? d.lunch_end.toISOString().split('T')[1].substring(0, 5) : null,
            userName: d.USERS?.name,
            userPhone: d.USERS?.phone,
        }));
    }

    async update(id: number, data: any) {
        const updateData: any = { ...data };
        const timeFields = ['work_start', 'work_end', 'lunch_start', 'lunch_end'];

        timeFields.forEach(field => {
            if (data[field]) {
                updateData[field] = new Date(`1970-01-01T${data[field]}:00Z`);
            }
        });

        const designer = await this.prisma.dESIGNERS.update({
            where: { designer_id: BigInt(id) },
            data: updateData,
            include: { USERS: { select: { name: true } } }
        });

        return {
            ...designer,
            designer_id: designer.designer_id.toString(),
            user_id: designer.user_id.toString(),
            shop_id: designer.shop_id.toString(),
            work_start: designer.work_start ? designer.work_start.toISOString().split('T')[1].substring(0, 5) : null,
            work_end: designer.work_end ? designer.work_end.toISOString().split('T')[1].substring(0, 5) : null,
            lunch_start: designer.lunch_start ? designer.lunch_start.toISOString().split('T')[1].substring(0, 5) : null,
            lunch_end: designer.lunch_end ? designer.lunch_end.toISOString().split('T')[1].substring(0, 5) : null,
            userName: designer.USERS?.name,
        };
    }
    async create(shopId: number, data: any) {
        // 1. Check if user exists by phone
        let user = await this.prisma.uSERS.findFirst({
            where: { phone: data.phone }
        });

        // 2. If not, create new user
        if (!user) {
            user = await this.prisma.uSERS.create({
                data: {
                    name: data.name,
                    phone: data.phone,
                    role: 'DESIGNER', // Or use existing role enum if any
                    created_at: new Date(),
                }
            });
        }

        // 3. Create Designer linked to user
        const designer = await this.prisma.dESIGNERS.create({
            data: {
                shop_id: BigInt(shopId),
                user_id: user.user_id,
                intro_text: data.intro_text,
                is_active: true,
            },
            include: { USERS: true }
        });

        return {
            ...designer,
            designer_id: designer.designer_id.toString(),
            user_id: designer.user_id.toString(),
            shop_id: designer.shop_id.toString(),
            userName: designer.USERS.name,
            userPhone: designer.USERS.phone,
        };
    }
}
