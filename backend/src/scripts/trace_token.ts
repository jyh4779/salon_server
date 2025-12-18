
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        const user = await prisma.uSERS.findUnique({
            where: { user_id: BigInt(1) }, // Admin User
            select: { current_hashed_refresh_token: true }
        });

        if (!user) {
            console.log("User 1 not found");
        } else {
            const token = user.current_hashed_refresh_token;
            console.log("---------------------------------------------------");
            console.log(`[DB STATE] User 1 Token Hash: ${token ? token.substring(0, 15) + '...' : 'NULL'}`);
            console.log("---------------------------------------------------");
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
