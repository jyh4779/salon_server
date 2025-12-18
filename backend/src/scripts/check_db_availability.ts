
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
    const shop = await prisma.sHOPS.findUnique({ where: { shop_id: BigInt(1) } });
    console.log('--- Shop Data ---');
    console.log('Open:', shop?.open_time);
    console.log('Close:', shop?.close_time);
    console.log('Closed Days:', shop?.closed_days);

    const designers = await prisma.dESIGNERS.findMany({ include: { USERS: true } });
    console.log('\n--- Designers Data ---');
    designers.forEach(d => {
        console.log(`[${d.USERS.name}] Off: ${d.day_off}, Lunch: ${d.lunch_start}~${d.lunch_end}`);
    });
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect());
