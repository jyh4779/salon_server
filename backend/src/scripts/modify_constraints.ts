
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        console.log('1. Dropping Foreign Key DESIGNERS_user_id_fkey...');
        await prisma.$executeRawUnsafe(`ALTER TABLE DESIGNERS DROP FOREIGN KEY DESIGNERS_user_id_fkey`);

        console.log('2. Dropping Unique Index user_id...');
        await prisma.$executeRawUnsafe(`DROP INDEX user_id ON DESIGNERS`);

        console.log('3. Adding Non-Unique Index user_id...');
        await prisma.$executeRawUnsafe(`CREATE INDEX user_id ON DESIGNERS(user_id)`);

        console.log('4. Re-adding Foreign Key DESIGNERS_user_id_fkey...');
        await prisma.$executeRawUnsafe(`
      ALTER TABLE DESIGNERS
      ADD CONSTRAINT DESIGNERS_user_id_fkey
      FOREIGN KEY (user_id) REFERENCES USERS(user_id)
      ON DELETE CASCADE ON UPDATE RESTRICT
    `);

        console.log('Successfully modified constraints!');
    } catch (e) {
        console.error('Error modifying constraints:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
