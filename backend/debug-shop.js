
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const shop = await prisma.sHOPS.findUnique({
        where: { shop_id: 1 },
    });
    console.log(shop);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
