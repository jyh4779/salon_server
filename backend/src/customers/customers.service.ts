import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CustomersService {
    constructor(private readonly prisma: PrismaService) { }

    async findAll(search?: string) {
        const whereCondition = {
            role: 'CUSTOMER' as const,
            ...(search && {
                OR: [
                    { name: { contains: search } },
                    { phone: { contains: search } },
                ],
            }),
        };

        const customers = await this.prisma.uSERS.findMany({
            where: whereCondition,
            include: {
                RESERVATIONS: {
                    select: {
                        start_time: true,
                        status: true,
                        RESERVATION_ITEMS: {
                            select: {
                                price: true
                            }
                        }
                    }
                },
                target_user_memos: {
                    orderBy: {
                        memo_id: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: {
                created_at: 'desc',
            },
        });

        // Aggregate data in memory/application level
        // (Prisma doesn't support complex aggregation in findMany cleanly without raw query group by for this specific join structure easily)
        return customers.map(customer => {
            const reservations = customer.RESERVATIONS;
            const latestMemo = customer.target_user_memos?.[0]?.content || '';

            // Filter out canceled/noshow for valid visit counts if needed (Business logic decision)
            // Usually visit count includes completed or confirmed.
            // Let's assume 'COMPLETED' is a visit for calculation.
            const completedReservations = reservations.filter(r => r.status === 'COMPLETED');
            const visitCount = completedReservations.length;
            const noshowCount = reservations.filter(r => r.status === 'NOSHOW').length;

            // Last visit
            const lastVisit = completedReservations.length > 0
                ? completedReservations.sort((a, b) => new Date(b.start_time).getTime() - new Date(a.start_time).getTime())[0].start_time
                : null;

            // Total Pay
            const totalPay = completedReservations.reduce((sum, r) => {
                const itemPrice = r.RESERVATION_ITEMS?.reduce((iSum, item) => iSum + item.price, 0) || 0;
                return sum + itemPrice;
            }, 0);

            // Grade Logic (Dynamic Calculation)
            // 1. CAUTION: No-Show >= 2
            // 2. VIP: Visit >= 10 OR Total Pay >= 1,000,000
            // 3. NEW: Visit <= 3
            // 4. NORMAL: Others
            let calculatedGrade = 'NORMAL';
            if (noshowCount >= 2) {
                calculatedGrade = 'CAUTION';
            } else if (visitCount >= 10 || totalPay >= 1000000) {
                calculatedGrade = 'VIP';
            } else if (visitCount <= 3) {
                calculatedGrade = 'NEW';
            }
            // else remain NORMAL

            return {
                id: customer.user_id,
                name: customer.name,
                phone: customer.phone,
                gender: customer.gender,
                grade: calculatedGrade, // Use calculated grade
                created_at: customer.created_at,
                visit_count: visitCount,
                last_visit: lastVisit,
                total_pay: totalPay,
                memo: latestMemo
            };
        });
    }
}
