import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const count = await prisma.rESERVATIONS.count();
    console.log(`Total Reservations in DB: ${count}`);

    if (count > 0) {
        const first = await prisma.rESERVATIONS.findFirst();
        console.log('Sample Reservation:', first);
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
