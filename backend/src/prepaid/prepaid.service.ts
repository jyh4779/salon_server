import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTicketDto, ChargePrepaidDto } from './dto/prepaid.dto';

@Injectable()
export class PrepaidService {
    constructor(private prisma: PrismaService) { }

    async createTicket(shopId: number, dto: CreateTicketDto) {
        return this.prisma.pREPAID_TICKETS.create({
            data: {
                shop_id: shopId,
                name: dto.name,
                price: dto.price,
                credit_amount: dto.credit_amount,
                validity_days: dto.validity_days,
                is_active: true,
            },
        });
    }

    async getTickets(shopId: number) {
        return this.prisma.pREPAID_TICKETS.findMany({
            where: { shop_id: shopId, is_active: true },
            orderBy: { price: 'asc' },
        });
    }

    async getBalance(shopId: number, userId: number) {
        const balance = await this.prisma.cUSTOMER_PREPAID_BALANCES.findUnique({
            where: {
                user_id_shop_id: {
                    user_id: BigInt(userId),
                    shop_id: BigInt(shopId),
                },
            },
        });
        return {
            balance: balance ? balance.balance : 0,
            lastUsed: balance ? balance.last_used_at : null,
        };
    }

    async chargePrepaid(shopId: number, userId: number, dto: ChargePrepaidDto) {
        // Determine amount and bonus
        let chargeAmount = 0;
        let bonusAmount = 0;
        let totalCredit = 0;

        if (dto.ticketId) {
            const ticket = await this.prisma.pREPAID_TICKETS.findUnique({
                where: { ticket_id: BigInt(dto.ticketId) },
            });
            if (!ticket) throw new BadRequestException('Invalid Ticket ID');

            chargeAmount = ticket.price;
            totalCredit = ticket.credit_amount;
            bonusAmount = totalCredit - chargeAmount;
        } else {
            if (!dto.amount) throw new BadRequestException('Amount is required for manual charge');
            chargeAmount = dto.amount;
            bonusAmount = dto.bonusAmount || 0;
            totalCredit = chargeAmount + bonusAmount;
        }

        // Transaction: Update Balance & Log History
        return this.prisma.$transaction(async (tx) => {
            // 1. Upsert Balance
            const balanceRecord = await tx.cUSTOMER_PREPAID_BALANCES.upsert({
                where: {
                    user_id_shop_id: {
                        user_id: BigInt(userId),
                        shop_id: BigInt(shopId),
                    },
                },
                update: {
                    balance: { increment: totalCredit },
                },
                create: {
                    user_id: BigInt(userId),
                    shop_id: BigInt(shopId),
                    balance: totalCredit,
                },
            });

            // 2. Log Transaction
            await tx.pREPAID_TRANSACTIONS.create({
                data: {
                    balance_id: balanceRecord.balance_id,
                    type: 'CHARGE',
                    amount: totalCredit,
                    bonus_amount: bonusAmount,
                    balance_after: balanceRecord.balance,
                    payment_method: dto.paymentMethod || 'CASH'
                },
            });

            return {
                success: true,
                charged: chargeAmount,
                totalBalance: balanceRecord.balance,
            };
        });
    }
    async usePrepaid(shopId: number, userId: number, amount: number) {
        return this.prisma.$transaction(async (tx) => {
            const balanceRecord = await tx.cUSTOMER_PREPAID_BALANCES.findUnique({
                where: {
                    user_id_shop_id: {
                        user_id: BigInt(userId),
                        shop_id: BigInt(shopId),
                    },
                },
            });

            if (!balanceRecord || balanceRecord.balance < amount) {
                throw new BadRequestException('잔액이 부족합니다.');
            }

            // Deduct Balance
            const updated = await tx.cUSTOMER_PREPAID_BALANCES.update({
                where: { balance_id: balanceRecord.balance_id },
                data: {
                    balance: { decrement: amount },
                    last_used_at: new Date(),
                },
            });

            // Log Transaction
            await tx.pREPAID_TRANSACTIONS.create({
                data: {
                    balance_id: balanceRecord.balance_id,
                    type: 'USE', // USE
                    amount: amount,
                    balance_after: updated.balance,
                },
            });

            return updated;
        });
    }
}
