import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitLogDto } from './dto/create-visit-log.dto';

@Injectable()
export class VisitLogsService {
    constructor(private prisma: PrismaService) { }

    async create(shopId: number, createVisitLogDto: CreateVisitLogDto) {
        // Convert string[] to JSON string for DB storage
        const photoUrlsJson = createVisitLogDto.photo_urls
            ? JSON.stringify(createVisitLogDto.photo_urls)
            : '[]';

        const log = await this.prisma.vISIT_LOGS.create({
            data: {
                customer_id: BigInt(createVisitLogDto.customer_id),
                reservation_id: BigInt(createVisitLogDto.reservation_id),
                designer_id: BigInt(createVisitLogDto.designer_id),
                admin_memo: createVisitLogDto.admin_memo,
                photo_urls: photoUrlsJson,
                visited_at: new Date(),
            },
        });

        return this.mapToDto(log);
    }

    async findByReservation(shopId: number, reservationId: number) {
        const log = await this.prisma.vISIT_LOGS.findFirst({
            where: {
                reservation_id: BigInt(reservationId),
                RESERVATIONS: {
                    shop_id: BigInt(shopId)
                }
            },
            include: {
                RESERVATIONS: {
                    include: { RESERVATION_ITEMS: { include: { MENUS: true } } }
                }
            }
        });

        if (!log) return null;
        return this.mapToDto(log);
    }

    async findByCustomer(shopId: number, customerId: number, page: number = 1, limit: number = 9) {
        const skip = (page - 1) * limit;

        const whereCondition = {
            customer_id: BigInt(customerId),
            RESERVATIONS: {
                shop_id: BigInt(shopId)
            }
        };

        const [logs, total] = await Promise.all([
            this.prisma.vISIT_LOGS.findMany({
                where: whereCondition,
                orderBy: { visited_at: 'desc' },
                skip,
                take: limit,
                include: {
                    DESIGNERS: {
                        include: { USERS: true }
                    }, // To show designer name if needed
                    RESERVATIONS: {
                        include: {
                            RESERVATION_ITEMS: {
                                include: { MENUS: true }
                            }
                        }
                    }
                }
            }),
            this.prisma.vISIT_LOGS.count({
                where: whereCondition,
            })
        ]);

        return {
            data: logs.map(log => this.mapToDto(log)),
            total
        };
    }

    private mapToDto(log: any) {
        return {
            ...log,
            log_id: log.log_id.toString(),
            customer_id: log.customer_id.toString(),
            reservation_id: log.reservation_id.toString(),
            designer_id: log.designer_id.toString(),
            photo_urls: log.photo_urls ? JSON.parse(log.photo_urls) : [],
            menu_names: log.RESERVATIONS?.RESERVATION_ITEMS?.map((item: any) => item.menu_name) || [],
            categories: log.RESERVATIONS?.RESERVATION_ITEMS?.flatMap((item: any) => item.MENUS?.category).filter(Boolean) || [],
        };
    }
}
