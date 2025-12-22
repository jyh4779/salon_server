
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ShopAuthGuard implements CanActivate {
    constructor(private prisma: PrismaService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;
        const params = request.params;
        const query = request.query;

        // 1. Get Shop ID from URL Param or Query Param
        const shopId = params.shopId || query.shop_id;

        if (!shopId) {
            return true; // No shop context, allow pass (or handle specifically)
        }

        if (!user || !user.userId) {
            return false;
        }

        // 2. Check Shop Ownership
        // Find shop by ID and Owner ID
        const shop = await this.prisma.sHOPS.findFirst({
            where: {
                shop_id: BigInt(shopId),
                owner_id: BigInt(user.userId),
            },
        });

        if (!shop) {
            throw new ForbiddenException('You do not have access to this shop.');
        }

        return true;
    }
}
