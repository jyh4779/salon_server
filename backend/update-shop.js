
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // 1970-01-01 is arbitrary date for Time type
    const openTime = new Date('1970-01-01T10:00:00Z');
    const closeTime = new Date('1970-01-01T20:00:00Z');

    const shop = await prisma.sHOPS.update({
        where: { shop_id: 1n },
        data: {
            open_time: openTime,
            close_time: closeTime
        }
    });
    console.log("Updated:", shop);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
