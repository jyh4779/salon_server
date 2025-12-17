import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as dayjs from 'dayjs';

@Injectable()
export class SalesService {
    constructor(private readonly prisma: PrismaService) { }

    async getDailySales(date: string) {
        try {
            const startOfDay = dayjs(date).startOf('day').toDate();
            const endOfDay = dayjs(date).endOf('day').toDate();

            // Fetch Completed Reservations for the day
            const reservations = await this.prisma.rESERVATIONS.findMany({
                where: {
                    start_time: {
                        gte: startOfDay,
                        lte: endOfDay
                    },
                    status: 'COMPLETED'
                },
                include: {
                    USERS: true, // Customer
                    DESIGNERS: {
                        include: {
                            USERS: true
                        }
                    },
                    RESERVATION_ITEMS: true,
                    PAYMENTS: true
                },
                orderBy: {
                    start_time: 'desc'
                }
            });

            // Aggregation
            let totalSales = 0;
            let cardSales = 0;
            let cashSales = 0;
            let depositSales = 0; // APP_DEPOSIT

            // Initialize Maps
            const designerMap = new Map<string, { name: string, totalSales: number, count: number }>();
            const menuMap = new Map<string, { name: string, totalSales: number, count: number }>();

            const reservationList = reservations.map((r: any) => {
                try {
                    const payments = r.PAYMENTS || [];
                    const reservationTotal = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

                    // Payment breakdown for stats
                    payments.forEach((p: any) => {
                        totalSales += p.amount;
                        if (p.type === 'SITE_CARD') cardSales += p.amount;
                        else if (p.type === 'SITE_CASH') cashSales += p.amount;
                        else if (p.type === 'APP_DEPOSIT') depositSales += p.amount;
                    });

                    // Designer Stats Aggregation
                    const designerName = r.DESIGNERS?.USERS?.name || 'Unknown';
                    const designerStats = designerMap.get(designerName) || { name: designerName, totalSales: 0, count: 0 };
                    designerStats.totalSales += reservationTotal;
                    designerStats.count += 1;
                    designerMap.set(designerName, designerStats);

                    // Menu Stats Aggregation
                    const items = r.RESERVATION_ITEMS || [];
                    items.forEach((item: any) => {
                        const menuName = item.menu_name || 'Unknown';
                        const menuLimitStats = menuMap.get(menuName) || { name: menuName, totalSales: 0, count: 0 };
                        // Note: We use item.price for menu stats. 
                        // If multiple items exist in one reservation, sum of item.price might differ slightly from total payment if discounts applied globally,
                        // but for menu popularity stats, item.price is the most accurate metric available here.
                        menuLimitStats.totalSales += item.price;
                        menuLimitStats.count += 1;
                        menuMap.set(menuName, menuLimitStats);
                    });

                    return {
                        id: r.reservation_id,
                        time: r.start_time,
                        customer: r.USERS?.name || 'Unknown',
                        customerId: r.USERS?.user_id || 0,
                        designer: r.DESIGNERS?.USERS?.name || 'Unknown',
                        menus: r.RESERVATION_ITEMS?.map((i: any) => i.menu_name).join(', ') || '',
                        totalPrice: reservationTotal,
                        paymentType: payments.map((p: any) => p.type).join(', '),
                    };
                } catch (error) {
                    console.error(`Error processing reservation ${r.reservation_id}:`, error);
                    return null;
                }
            }).filter(item => item !== null);

            const designerStats = Array.from(designerMap.values());
            const menuStats = Array.from(menuMap.values());

            return {
                date: date,
                stats: {
                    totalSales,
                    cardSales,
                    cashSales,
                    depositSales,
                    count: reservations.length
                },
                designerStats,
                menuStats,
                reservations: reservationList
            };
        } catch (error) {
            console.error('getDailySales Error:', error);
            throw new InternalServerErrorException(`Failed to get sales data: ${error.message}`);
        }
    }
}
