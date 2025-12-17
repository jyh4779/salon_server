
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const table = 'DESIGNERS';
    const dbName = 'salon_db'; // Assuming db name from connection string or env, but we can query current schema

    try {
        const constraints = await prisma.$queryRaw`
        SELECT CONSTRAINT_NAME, CONSTRAINT_TYPE
        FROM information_schema.TABLE_CONSTRAINTS
        WHERE TABLE_NAME = ${table}
        AND CONSTRAINT_SCHEMA = DATABASE()
      `;
        console.log('Constraints:', constraints);

        const indexes = await prisma.$queryRaw`
        SHOW INDEX FROM DESIGNERS
      `;
        console.log('Indexes:', indexes);

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
