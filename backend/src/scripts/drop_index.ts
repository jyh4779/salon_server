
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // Attempt to drop the unique index 'user_id' on DESIGNERS table
        await prisma.$executeRawUnsafe(`DROP INDEX user_id ON DESIGNERS`);
        console.log('Successfully dropped index user_id on DESIGNERS');
    } catch (e) {
        console.error('Error dropping index (it might not exist):', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
