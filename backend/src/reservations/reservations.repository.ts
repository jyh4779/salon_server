import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReservationsRepository {
    constructor(private prisma: PrismaService) { }

    async getReservations(startDate: string, endDate: string) {
        return this.prisma.rESERVATIONS.findMany({
            where: {
                start_time: {
                    gte: new Date(startDate),
                    lte: new Date(endDate),
                },
            },
            include: {
                USERS: {
                    select: {
                        name: true,
                        phone: true
                    }
                },
                DESIGNERS: {
                    include: {
                        USERS: {
                            select: {
                                name: true
                            }
                        }
                    }
                }
            },
            orderBy: {
                start_time: 'asc',
            },
        });
    }
}
