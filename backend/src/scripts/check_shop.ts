import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const shop = await prisma.sHOPS.findUnique({
        where: { shop_id: 1 },
        include: { USERS: true }
    });

    if (shop) {
        console.log('Shop 1 Owner:', {
            shopName: shop.name,
            ownerId: shop.owner_id,
            ownerName: shop.USERS.name,
            ownerEmail: shop.USERS.email
        });
    } else {
        console.log('Shop 1 not found');
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
