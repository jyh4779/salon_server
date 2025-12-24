import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

@Injectable()
export class SalesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly timeService: TimeService
    ) { }

    async getDailySales(shopId: number, date: string) {
        try {
            const startOfDay = this.timeService.parse(date).startOf('day').toDate();
            const endOfDay = this.timeService.parse(date).endOf('day').toDate();

            // 1. Fetch Reservations (For Service Revenue & Stats)
            const reservations = await this.prisma.rESERVATIONS.findMany({
                where: {
                    start_time: { gte: startOfDay, lte: endOfDay },
                    status: { in: ['COMPLETED', 'CANCELED', 'NOSHOW'] },
                    shop_id: BigInt(shopId)
                },
                include: {
                    USERS: true,
                    DESIGNERS: { include: { USERS: true } },
                    RESERVATION_ITEMS: {
                        include: {
                            MENUS: { include: { parent: true } }
                        }
                    },
                    PAYMENTS: true
                },
                orderBy: { start_time: 'desc' }
            });

            // 2. Fetch Direct Payments (For Cash Flow - Site Sales)
            const directPayments = await this.prisma.pAYMENTS.findMany({
                where: {
                    reservation_id: { in: reservations.map(r => r.reservation_id) }, // Link to fetched reservations for consistency, or use paid_at for strict cash flow?
                    // User said "Card/Cash" (Site). 
                    // To be safe and aligned with "Revenue", let's use the Payments FROM the reservations we just fetched.
                    // But wait, "Cash Flow" means "Money In". 
                    // If I use reservations, I get "Revenue".
                    // The plan said: "Data Source 1 (Direct Payments): Payments table query".
                    // Let's query PAYMENTS by date for Strict Cash Flow.
                    paid_at: { gte: startOfDay, lte: endOfDay },
                    type: { in: ['SITE_CARD', 'SITE_CASH'] }
                }
            });

            // 3. Fetch Prepaid Charges (For Cash Flow - Prepaid Sales)
            const prepaidCharges = await this.prisma.pREPAID_TRANSACTIONS.findMany({
                where: {
                    created_at: { gte: startOfDay, lte: endOfDay },
                    type: 'CHARGE',
                    CUSTOMER_PREPAID_BALANCES: { shop_id: BigInt(shopId) } // Ensure shop scope
                }
            });


            // --- Aggregation Core ---

            // A. Service Revenue (Based on COMPLETED Reservations)
            let revenue = {
                total: 0,
                breakdown: { card: 0, cash: 0, prepaid: 0, app: 0 }
            };

            // B. Cash Flow (Based on Actual Money In)
            let cashFlow = {
                total: 0,
                breakdown: {
                    site_card: 0,
                    site_cash: 0,
                    prepaid_charge_card: 0,
                    prepaid_charge_cash: 0
                }
            };

            // Calculate Revenue & Stats
            let completedCount = 0;
            let cancelCount = 0;
            let noshowCount = 0;
            let newCustomerCount = 0;
            let returningCustomerCount = 0;

            const designerMap = new Map<string, { name: string, totalSales: number, count: number, avgTicket: number }>();
            const categoryMap = new Map<string, { name: string, totalSales: number, count: number }>();

            // Process Reservations
            const reservationList = reservations.map((r: any) => {
                const isCompleted = r.status === 'COMPLETED';
                const payments = r.PAYMENTS || [];
                const reservationTotal = payments.reduce((sum: number, p: any) => sum + p.amount, 0);

                if (r.status === 'CANCELED') cancelCount++;
                else if (r.status === 'NOSHOW') noshowCount++;
                else if (isCompleted) {
                    completedCount++;
                    // Revenue Calculation (Accrual Basis)
                    revenue.total += reservationTotal;

                    payments.forEach((p: any) => {
                        if (p.type === 'SITE_CARD') revenue.breakdown.card += p.amount;
                        else if (p.type === 'SITE_CASH') revenue.breakdown.cash += p.amount;
                        else if (p.type === 'PREPAID') revenue.breakdown.prepaid += p.amount;
                        else if (p.type === 'APP_DEPOSIT') revenue.breakdown.app += p.amount;
                    });

                    // Stats
                    const userCreatedAt = new Date(r.USERS.created_at);
                    if (userCreatedAt >= startOfDay && userCreatedAt <= endOfDay) newCustomerCount++;
                    else returningCustomerCount++;

                    // Designer Stats
                    const designerName = r.DESIGNERS?.USERS?.name || 'Unknown';
                    const dStats = designerMap.get(designerName) || { name: designerName, totalSales: 0, count: 0, avgTicket: 0 };
                    dStats.totalSales += reservationTotal;
                    dStats.count += 1;
                    designerMap.set(designerName, dStats);

                    // Category Stats
                    (r.RESERVATION_ITEMS || []).forEach((item: any) => {
                        let categoryName = item.MENUS?.parent?.name || item.MENUS?.category || '기타';
                        const cStats = categoryMap.get(categoryName) || { name: categoryName, totalSales: 0, count: 0 };
                        cStats.totalSales += item.price;
                        cStats.count += 1;
                        categoryMap.set(categoryName, cStats);
                    });
                }

                return {
                    id: r.reservation_id,
                    time: r.start_time,
                    status: r.status,
                    customer: r.USERS?.name || 'Unknown',
                    customerId: r.USERS?.user_id || 0,
                    designer: r.DESIGNERS?.USERS?.name || 'Unknown',
                    menus: r.RESERVATION_ITEMS?.map((i: any) => i.menu_name).join(', ') || '',
                    totalPrice: reservationTotal,
                    paymentType: payments.map((p: any) => p.type).join(', '),
                    payments: payments.map((p: any) => ({ type: p.type, amount: p.amount })),
                };
            });

            // Calculate Cash Flow
            // 1. Site Payments
            directPayments.forEach((p: any) => {
                if (p.type === 'SITE_CARD') cashFlow.breakdown.site_card += p.amount;
                else if (p.type === 'SITE_CASH') cashFlow.breakdown.site_cash += p.amount;
            });
            // 2. Prepaid Charges
            prepaidCharges.forEach((p: any) => {
                const method = p.payment_method || 'CASH'; // Default to CASH
                if (method === 'CARD') cashFlow.breakdown.prepaid_charge_card += p.amount;
                else cashFlow.breakdown.prepaid_charge_cash += p.amount; // CASH or Default
            });

            cashFlow.total =
                cashFlow.breakdown.site_card +
                cashFlow.breakdown.site_cash +
                cashFlow.breakdown.prepaid_charge_card +
                cashFlow.breakdown.prepaid_charge_cash;

            // Final Stats Formatting
            const avgTicket = completedCount > 0 ? Math.round(revenue.total / completedCount) : 0;
            const designerStats = Array.from(designerMap.values()).map(d => ({ ...d, avgTicket: d.count > 0 ? Math.round(d.totalSales / d.count) : 0 }));
            const categoryStats = Array.from(categoryMap.values()).map(c => ({ name: c.name, value: c.totalSales, count: c.count })).sort((a, b) => b.value - a.value);

            return {
                date: date,
                revenue, // New: Service Revenue
                cashFlow, // New: Cash Flow
                stats: {
                    totalSales: revenue.total, // Align with revenue
                    cardSales: revenue.breakdown.card,
                    cashSales: revenue.breakdown.cash,
                    appSales: revenue.breakdown.app,
                    depositSales: 0, // Deprecated or kept for structure
                    count: completedCount,
                    cancelCount,
                    noshowCount,
                    newCustomerCount,
                    returningCustomerCount,
                    avgTicket
                },
                designerStats,
                menuStats: categoryStats,
                reservations: reservationList
            };
        } catch (error) {
            console.error('getDailySales Error:', error);
            throw new InternalServerErrorException(`Failed to get sales data: ${error.message}`);
        }
    }

    async getWeeklySales(shopId: number, date: string) {
        try {
            const today = this.timeService.parse(date);
            // ISO week starts on Monday
            const startOfWeek = today.startOf('isoWeek').startOf('day').toDate();
            const endOfWeek = today.endOf('isoWeek').endOf('day').toDate();

            const startOfLastWeek = today.subtract(1, 'week').startOf('isoWeek').startOf('day').toDate();
            const endOfLastWeek = today.subtract(1, 'week').endOf('isoWeek').endOf('day').toDate();

            // Fetch Reservations for both weeks
            const reservations = await this.prisma.rESERVATIONS.findMany({
                where: {
                    start_time: { gte: startOfLastWeek, lte: endOfWeek },
                    status: 'COMPLETED',
                    shop_id: BigInt(shopId)
                },
                include: {
                    USERS: true,
                    DESIGNERS: { include: { USERS: true } },
                    RESERVATION_ITEMS: {
                        include: {
                            MENUS: { include: { parent: true } }
                        }
                    },
                    PAYMENTS: true
                },
                orderBy: { start_time: 'asc' }
            });

            // Helper to aggregate data
            const aggregate = (start: Date, end: Date) => {
                let totalSales = 0;
                let count = 0;
                let appSales = 0; // For verification if needed, or just total

                // For Stats
                const designerMap = new Map<string, { id: number, name: string, totalSales: number, count: number }>();
                const categoryMap = new Map<string, { name: string, totalSales: number, count: number }>();
                const customerMap = { new: 0, returning: 0 };
                const dailySales = new Map<string, number>();

                // Initialize daily sales map for the week range
                let current = this.timeService.parse(start);
                const endDate = this.timeService.parse(end);
                while (current.isBefore(endDate) || current.isSame(endDate)) {
                    dailySales.set(current.format('YYYY-MM-DD'), 0);
                    current = current.add(1, 'day');
                }

                reservations.forEach(r => {
                    const rTime = new Date(r.start_time);
                    if (rTime >= start && rTime <= end) {
                        const payments = r.PAYMENTS || [];
                        const reservationTotal = payments.reduce((sum, p) => sum + p.amount, 0);

                        totalSales += reservationTotal;
                        count++;

                        // Daily Trend
                        const dayKey = this.timeService.format(rTime, 'YYYY-MM-DD');
                        dailySales.set(dayKey, (dailySales.get(dayKey) || 0) + reservationTotal);

                        // Designer Stats
                        const dName = r.DESIGNERS?.USERS?.name || 'Unknown';
                        const dId = Number(r.designer_id);
                        const dStats = designerMap.get(dName) || { id: dId, name: dName, totalSales: 0, count: 0 };
                        dStats.totalSales += reservationTotal;
                        dStats.count++;
                        designerMap.set(dName, dStats);

                        // Category Stats
                        (r.RESERVATION_ITEMS || []).forEach((item: any) => {
                            let categoryName = item.MENUS?.parent?.name || item.MENUS?.category || '기타';
                            const cStats = categoryMap.get(categoryName) || { name: categoryName, totalSales: 0, count: 0 };
                            cStats.totalSales += item.price;
                            cStats.count++;
                            categoryMap.set(categoryName, cStats);
                        });

                        // Customer Stats
                        if (r.USERS) {
                            const userCreatedAt = new Date(r.USERS.created_at);
                            if (userCreatedAt >= start && userCreatedAt <= end) {
                                customerMap.new++;
                            } else {
                                customerMap.returning++;
                            }
                        }
                    }
                });

                return {
                    totalSales,
                    count,
                    avgTicket: count > 0 ? Math.round(totalSales / count) : 0,
                    dailySales,
                    designerMap,
                    categoryMap,
                    customerMap
                };
            };

            const thisWeek = aggregate(startOfWeek, endOfWeek);
            const lastWeek = aggregate(startOfLastWeek, endOfLastWeek);

            // Calculate Growth (WoW)
            const calcGrowth = (current: number, prev: number) => {
                if (prev === 0) return current === 0 ? 0 : null; // null means 'New' (start from 0)
                return Number((((current - prev) / prev) * 100).toFixed(1));
            };

            const summary = {
                totalSales: thisWeek.totalSales,
                totalSalesGrowth: calcGrowth(thisWeek.totalSales, lastWeek.totalSales),
                count: thisWeek.count,
                countGrowth: calcGrowth(thisWeek.count, lastWeek.count),
                avgTicket: thisWeek.avgTicket,
                avgTicketGrowth: calcGrowth(thisWeek.avgTicket, lastWeek.avgTicket),
            };

            // Format Trend
            const days = ['월', '화', '수', '목', '금', '토', '일'];
            const trend = Array.from(thisWeek.dailySales.entries()).map(([dateStr, sales], index) => ({
                day: days[index], // Since we started isoWeek (Mon), order is correct? 
                // Wait, map iteration order is insertion order in simple cases, but verify.
                // We initialized map from Start Date (Mon) to End. So order is preserved.
                // However, let's be safe.
                dayName: this.timeService.parse(dateStr).format('ddd'), // Check locale
                date: dateStr,
                sales
            }));

            // Format Designer Stats
            const designerStats = Array.from(thisWeek.designerMap.values())
                .map(d => ({ ...d, avgTicket: d.count > 0 ? Math.round(d.totalSales / d.count) : 0 }))
                .sort((a, b) => b.totalSales - a.totalSales);

            // Format Category Stats
            const categoryStats = Array.from(thisWeek.categoryMap.values())
                .map(c => ({ name: c.name, value: c.totalSales, count: c.count }))
                .sort((a, b) => b.value - a.value);

            // Format Customer Stats
            const customerStats = [
                { name: '신규 고객', value: thisWeek.customerMap.new },
                { name: '기존 고객', value: thisWeek.customerMap.returning }
            ];

            return {
                startOfWeek: this.timeService.format(startOfWeek, 'YYYY-MM-DD'),
                endOfWeek: this.timeService.format(endOfWeek, 'YYYY-MM-DD'),
                summary,
                trend: trend.map((t, i) => ({ day: days[i], sales: t.sales })), // Enforce Mon-Sun labels
                designerStats,
                categoryStats,
                customerStats
            };

        } catch (error) {
            console.error('getWeeklySales Error:', error);
            throw new InternalServerErrorException(`Failed to get weekly sales: ${error.message}`);
        }
    }
}
