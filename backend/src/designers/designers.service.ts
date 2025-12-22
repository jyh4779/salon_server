import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

@Injectable()
export class DesignersService {
    constructor(
        private prisma: PrismaService,
        private timeService: TimeService // Inject TimeService
    ) { }

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
            work_start: this.timeService.toUtcTimeStr(d.work_start),
            work_end: this.timeService.toUtcTimeStr(d.work_end),
            lunch_start: this.timeService.toUtcTimeStr(d.lunch_start),
            lunch_end: this.timeService.toUtcTimeStr(d.lunch_end),
            userName: d.USERS?.name,
            userPhone: d.USERS?.phone,
        }));
    }

    async update(id: number, data: any) {
        const updateData: any = { ...data };
        const timeFields = ['work_start', 'work_end', 'lunch_start', 'lunch_end'];

        timeFields.forEach(field => {
            if (data[field]) {
                updateData[field] = this.timeService.parseUtcTime(data[field]);
            }
        });

        if (data.name || data.phone) {
            // Phone sanitization
            const cleanPhone = data.phone ? data.phone.replace(/-/g, '') : undefined;

            // Find linked user_id first
            const currentDesigner = await this.prisma.dESIGNERS.findUnique({
                where: { designer_id: BigInt(id) },
                select: { user_id: true }
            });

            if (currentDesigner) {
                await this.prisma.uSERS.update({
                    where: { user_id: currentDesigner.user_id },
                    data: {
                        name: data.name,
                        phone: cleanPhone,
                    }
                });
            }

            // Remove from updateData to prevent Prisma error on DESIGNERS table
            delete updateData.name;
            delete updateData.phone;
        }

        const designer = await this.prisma.dESIGNERS.update({
            where: { designer_id: BigInt(id) },
            data: updateData,
            include: { USERS: { select: { name: true, phone: true } } }
        });

        return {
            ...designer,
            designer_id: designer.designer_id.toString(),
            user_id: designer.user_id.toString(),
            shop_id: designer.shop_id.toString(),
            work_start: this.timeService.toUtcTimeStr(designer.work_start),
            work_end: this.timeService.toUtcTimeStr(designer.work_end),
            lunch_start: this.timeService.toUtcTimeStr(designer.lunch_start),
            lunch_end: this.timeService.toUtcTimeStr(designer.lunch_end),
            userName: designer.USERS?.name,
        };
    }
    async create(shopId: number, data: any) {
        const cleanPhone = data.phone.replace(/-/g, '');

        // 1. Check if user exists by phone
        let user = await this.prisma.uSERS.findFirst({
            where: { phone: cleanPhone }
        });

        // 2. If not, create new user
        if (!user) {
            user = await this.prisma.uSERS.create({
                data: {
                    name: data.name,
                    phone: cleanPhone,
                    role: 'DESIGNER', // Or use existing role enum if any
                    created_at: this.timeService.now().toDate(),
                }
            });
        }

        // 3. Create Designer linked to user
        const timeFields = ['work_start', 'work_end', 'lunch_start', 'lunch_end'];
        const designerData: any = {
            shop_id: BigInt(shopId),
            user_id: user.user_id,
            intro_text: data.intro_text,
            profile_img: data.profile_img,
            is_active: true,
        };

        timeFields.forEach(field => {
            if (data[field]) {
                designerData[field] = this.timeService.parseUtcTime(data[field]);
            }
        });

        const designer = await this.prisma.dESIGNERS.create({
            data: designerData,
            include: { USERS: true }
        });

        return {
            ...designer,
            designer_id: designer.designer_id.toString(),
            user_id: designer.user_id.toString(),
            shop_id: designer.shop_id.toString(),
            work_start: this.timeService.toUtcTimeStr(designer.work_start),
            work_end: this.timeService.toUtcTimeStr(designer.work_end),
            lunch_start: this.timeService.toUtcTimeStr(designer.lunch_start),
            lunch_end: this.timeService.toUtcTimeStr(designer.lunch_end),
            userName: designer.USERS.name,
            userPhone: designer.USERS.phone,
        };
    }
}
