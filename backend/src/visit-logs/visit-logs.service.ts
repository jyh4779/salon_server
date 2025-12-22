import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateVisitLogDto } from './dto/create-visit-log.dto';

@Injectable()
export class VisitLogsService {
    constructor(private prisma: PrismaService) { }

    async create(createVisitLogDto: CreateVisitLogDto) {
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

    async findByReservation(reservationId: number) {
        const log = await this.prisma.vISIT_LOGS.findUnique({
            where: { reservation_id: BigInt(reservationId) },
        });

        if (!log) return null;
        return this.mapToDto(log);
    }

    async findByCustomer(customerId: number) {
        const logs = await this.prisma.vISIT_LOGS.findMany({
            where: { customer_id: BigInt(customerId) },
            orderBy: { visited_at: 'desc' },
            include: {
                DESIGNERS: {
                    include: { USERS: true }
                } // To show designer name if needed
            }
        });

        return logs.map(log => this.mapToDto(log));
    }

    private mapToDto(log: any) {
        return {
            ...log,
            log_id: log.log_id.toString(),
            customer_id: log.customer_id.toString(),
            reservation_id: log.reservation_id.toString(),
            designer_id: log.designer_id.toString(),
            photo_urls: log.photo_urls ? JSON.parse(log.photo_urls) : [],
        };
    }
}
