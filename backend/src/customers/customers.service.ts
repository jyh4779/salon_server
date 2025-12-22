import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TimeService } from '../common/time/time.service';

@Injectable()
export class CustomersService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly timeService: TimeService // Inject TimeService
    ) { }

    async findAll(shopId: number, search?: string) {
        const whereClause: any = {
            role: 'CUSTOMER',
            RESERVATIONS: {
                some: {
                    shop_id: BigInt(shopId)
                }
            }
        };

        if (search) {
            whereClause.OR = [
                { name: { contains: search } },
                { phone: { contains: search } },
            ];
        }

        const users = await this.prisma.uSERS.findMany({
            where: whereClause,
            include: {
                RESERVATIONS: {
                    where: { shop_id: BigInt(shopId) }, // Only consider this shop's reservations
                    orderBy: { start_time: 'desc' },
                    include: {
                        RESERVATION_ITEMS: {
                            select: { price: true }
                        }
                    }
                },
                target_user_memos: { // Keep original memo include for now, though new code doesn't use it in findAll return
                    orderBy: {
                        memo_id: 'desc'
                    },
                    take: 1
                }
            },
            orderBy: { created_at: 'desc' },
        });

        // Map to Stats DTO
        return users.map(user => {
            // The new code assumes payment_amount and ticket_name are directly on RESERVATIONS.
            // If RESERVATION_ITEMS are still needed for total_pay, the include for RESERVATIONS needs to be adjusted.
            // For now, I'll adapt to the new structure assuming payment_amount is directly on RESERVATIONS.
            const totalPay = user.RESERVATIONS.reduce((sum, r) => {
                const reservationTotal = (r as any).RESERVATION_ITEMS?.reduce((iSum, item) => iSum + item.price, 0) || 0;
                return sum + reservationTotal;
            }, 0);
            const visitCount = user.RESERVATIONS.filter(r => r.status === 'COMPLETED').length;
            const lastVisit = user.RESERVATIONS[0]?.start_time || null;
            const latestMemo = user.target_user_memos?.[0]?.content || ''; // Re-added memo from original findAll

            return {
                id: Number(user.user_id),
                name: user.name,
                phone: user.phone,
                gender: user.gender,
                grade: this.calculateGrade(visitCount, totalPay, user.RESERVATIONS.filter(r => r.status === 'NOSHOW').length), // Pass noshowCount for grade calculation
                created_at: user.created_at.toISOString(),
                visit_count: visitCount,
                last_visit: lastVisit ? lastVisit.toISOString() : null,
                total_pay: totalPay,
                memo: latestMemo, // Use latestMemo
            };
        });
    }
    async findOne(shopId: number, id: number) {
        const user = await this.prisma.uSERS.findUnique({
            where: { user_id: BigInt(id) }, // Ensure BigInt for user_id
            include: {
                RESERVATIONS: {
                    where: { shop_id: BigInt(shopId) },
                    orderBy: { start_time: 'desc' },
                    include: {
                        DESIGNERS: { // Changed from DESIGNER to DESIGNERS to match original schema
                            select: {
                                USERS: {
                                    select: {
                                        name: true
                                    }
                                }
                            }
                        },
                        RESERVATION_ITEMS: { // Re-added RESERVATION_ITEMS for menu_name and price
                            select: {
                                menu_name: true,
                                price: true
                            }
                        }
                    }
                },
                target_user_memos: {
                    where: { shop_id: BigInt(shopId) },
                    orderBy: { created_at: 'desc' },
                }
            }
        });

        if (!user) throw new NotFoundException('Customer not found');

        // Reuse Aggregation Logic
        const reservations = user.RESERVATIONS;

        // Use BigInt safe stats
        const completedReservations = reservations.filter((r: any) => r.status === 'COMPLETED');
        const visitCount = completedReservations.length;
        const noshowCount = reservations.filter((r: any) => r.status === 'NOSHOW').length;

        // Last visit
        const lastVisit = completedReservations.length > 0
            ? completedReservations.sort((a: any, b: any) => this.timeService.parse(b.start_time).valueOf() - this.timeService.parse(a.start_time).valueOf())[0].start_time
            : null;

        // Total Pay
        const totalPay = completedReservations.reduce((sum: number, r: any) => {
            // Using price directly from RESERVATION_ITEMS if included, or payment_amount if simplified
            // The query includes RESERVATION_ITEMS
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
                id: Number(r.reservation_id), // Use reservation_id as mixed ID
                content: r.request_memo,
                created_at: r.start_time, // Use reservation time as memo time
                type: 'RESERVATION',
                source_id: Number(r.reservation_id)
            }));

        const generalMemos = (user as any).target_user_memos?.map((m: any) => ({
            id: Number(m.memo_id),
            content: m.content,
            created_at: m.created_at,
            type: 'GENERAL',
            source_id: null
        })) || [];

        const joinedMemos = [...reservationMemos, ...generalMemos].sort((a: any, b: any) =>
            this.timeService.parse(b.created_at).valueOf() - this.timeService.parse(a.created_at).valueOf()
        );

        return {
            id: Number(user.user_id),
            name: user.name,
            phone: user.phone,
            gender: user.gender,
            grade: calculatedGrade,
            visit_count: visitCount,
            total_pay: totalPay,
            created_at: user.created_at.toISOString(),
            history: reservations.map((r: any) => ({
                id: Number(r.reservation_id),
                date: r.start_time.toISOString(),
                status: r.status,
                menus: r.RESERVATION_ITEMS?.map((i: any) => i.menu_name).join(', ') || '',
                price: r.RESERVATION_ITEMS?.reduce((sum: number, i: any) => sum + i.price, 0) || 0,
                designer: r.DESIGNERS?.USERS?.name || '미지정'
            })),
            memos: joinedMemos
        };
    }

    async createMemo(shopId: number, customerId: number, content: string, writerId: number) {
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

    private calculateGrade(visitCount: number, totalPay: number, noshowCount: number = 0): string {
        if (noshowCount >= 2) return 'CAUTION';
        if (visitCount >= 10 || totalPay >= 1000000) return 'VIP';
        if (visitCount <= 1) return 'NEW';
        return 'NORMAL';
    }
}
