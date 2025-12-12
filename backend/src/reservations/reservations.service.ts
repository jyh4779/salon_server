import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GetReservationsDto } from './dto/get-reservations.dto';

@Injectable()
export class ReservationsService {
    constructor(private prisma: PrismaService) { }

    async findAll(query: GetReservationsDto) {
        const { startDate, endDate } = query;

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
