import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    const email = 'owner@example.com';
    const plainPassword = 'password123';
    const saltRounds = 10;
    const hash = await bcrypt.hash(plainPassword, saltRounds);

    const user = await prisma.uSERS.update({
        where: { email },
        data: { password: hash },
    });

    console.log(`Updated user ${user.email} with hashed password.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
