import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'owner@example.com';
    const user = await prisma.uSERS.findUnique({
        where: { email },
    });

    if (user) {
        console.log('User found:', {
            id: user.user_id,
            email: user.email,
            role: user.role,
            passwordHash: user.password,
            // grade: user.grade, 
        });
    } else {
        console.log(`User with email ${email} not found.`);
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
