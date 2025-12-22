import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

@Injectable()
export class CustomersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly timeService: TimeService // Inject TimeService
    ) { }

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
                ? completedReservations.sort((a, b) => this.timeService.parse(b.start_time).valueOf() - this.timeService.parse(a.start_time).valueOf())[0].start_time
                : null;

            // Total Pay
            const totalPay = completedReservations.reduce((sum, r) => {
                const itemPrice = r.RESERVATION_ITEMS?.reduce((iSum, item) => iSum + item.price, 0) || 0;
                return sum + itemPrice;
            }, 0);

            // Grade Logic (Dynamic Calculation)
            // 1. CAUTION: No-Show >= 2
            // 2. VIP: Visit >= 10 OR Total Pay >= 1,000,000
            // 3. NEW: Visit <= 1
            // 4. NORMAL: Others
            let calculatedGrade = 'NORMAL';
            if (noshowCount >= 2) {
                calculatedGrade = 'CAUTION';
            } else if (visitCount >= 10 || totalPay >= 1000000) {
                calculatedGrade = 'VIP';
            } else if (visitCount <= 1) {
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
    async findOne(id: number) {
        const customer = await this.prisma.uSERS.findUnique({
            where: { user_id: BigInt(id) },
            include: {
                RESERVATIONS: {
                    select: {
                        reservation_id: true,
                        start_time: true,
                        status: true,
                        designer_id: true,
                        request_memo: true, // Select request_memo
                        RESERVATION_ITEMS: {
                            select: {
                                menu_name: true,
                                price: true
                            }
                        },
                        DESIGNERS: {
                            select: {
                                USERS: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        }
                    },
                    orderBy: {
                        start_time: 'desc'
                    }
                },
                target_user_memos: {
                    orderBy: {
                        created_at: 'desc'
                    }
                }
            }
        });

        if (!customer) return null;

        // Cast to any to access included relations without complex Prisma typing
        const customerData = customer as any;

        // Reuse Aggregation Logic
        const reservations = customerData.RESERVATIONS;

        // Use BigInt safe stats
        const completedReservations = reservations.filter((r: any) => r.status === 'COMPLETED');
        const visitCount = completedReservations.length;
        const noshowCount = reservations.filter((r: any) => r.status === 'NOSHOW').length;

        // Total Pay
        const totalPay = completedReservations.reduce((sum: number, r: any) => {
            const itemPrice = r.RESERVATION_ITEMS?.reduce((iSum: number, item: any) => iSum + item.price, 0) || 0;
            return sum + itemPrice;
        }, 0);

        // Grade Logic
        let calculatedGrade = 'NORMAL';
        if (noshowCount >= 2) {
            calculatedGrade = 'CAUTION';
        } else if (visitCount >= 10 || totalPay >= 1000000) {
            calculatedGrade = 'VIP';
        } else if (visitCount <= 1) {
            calculatedGrade = 'NEW';
        }

        // Merge Memos
        const reservationMemos = reservations
            .filter((r: any) => r.request_memo && r.request_memo.trim() !== '')
            .map((r: any) => ({
                id: r.reservation_id, // Use reservation_id as mixed ID
                content: r.request_memo,
                created_at: r.start_time, // Use reservation time as memo time
                type: 'RESERVATION',
                source_id: r.reservation_id
            }));

        const generalMemos = customerData.target_user_memos.map((m: any) => ({
            id: m.memo_id,
            content: m.content,
            created_at: m.created_at,
            type: 'GENERAL',
            source_id: null
        }));

        const joinedMemos = [...reservationMemos, ...generalMemos].sort((a, b) =>
            this.timeService.parse(b.created_at).valueOf() - this.timeService.parse(a.created_at).valueOf()
        );

        return {
            id: customerData.user_id,
            name: customerData.name,
            phone: customerData.phone,
            gender: customerData.gender,
            grade: calculatedGrade,
            visit_count: visitCount,
            total_pay: totalPay,
            created_at: customerData.created_at,
            history: reservations.map((r: any) => ({
                id: r.reservation_id,
                date: r.start_time,
                status: r.status,
                menus: r.RESERVATION_ITEMS?.map((i: any) => i.menu_name).join(', '),
                price: r.RESERVATION_ITEMS?.reduce((sum: number, i: any) => sum + i.price, 0) || 0,
                designer: r.DESIGNERS?.USERS?.name || '미지정'
            })),
            memos: joinedMemos // Return merged memos
        };
    }

    async createMemo(customerId: number, content: string) {
        // Assume default writer is admin/ID 1 for now (Simple MVP)
        // Ideally should get writer from auth context
        const writerId = 1;
        const shopId = 1; // Default shop

        return this.prisma.cUSTOMER_MEMOS.create({
            data: {
                user_id: BigInt(customerId),
                writer_id: BigInt(writerId),
                shop_id: BigInt(shopId),
                content: content,
                tags: '', // Optional
            }
        });
    }
}
