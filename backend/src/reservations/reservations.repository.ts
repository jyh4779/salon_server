import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReservationDto } from './dto/create-reservation.dto';
import { RESERVATIONS_status } from '@prisma/client';

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
                },
                RESERVATION_ITEMS: true,
            },
            orderBy: {
                start_time: 'asc',
            },
        });
    }

    async createReservation(data: CreateReservationDto & { menu?: { name: string, price: number } }) {
        const { treatment_id, menu, ...rest } = data;

        return this.prisma.rESERVATIONS.create({
            data: {
                shop_id: rest.shop_id,
                customer_id: rest.customer_id,
                designer_id: rest.designer_id,
                start_time: new Date(rest.start_time),
                end_time: new Date(rest.end_time),
                status: rest.status as RESERVATIONS_status,
                request_memo: rest.request_memo,
                alarm_enabled: rest.alarm_enabled,
                ...(menu && {
                    RESERVATION_ITEMS: {
                        create: {
                            menu_id: treatment_id,
                            menu_name: menu.name,
                            price: menu.price,
                        }
                    }
                })
            }
        });
    }
}
