import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Fixing reservation times to be visible (e.g. 13:00 KST)...');

    // Find all reservations
    const reservations = await prisma.rESERVATIONS.findMany();

    for (const res of reservations) {
        // Current Time
        const oldStart = new Date(res.start_time);

        // We want to set them to Today or Tomorrow at 13:00 KST (04:00 UTC)
        // Keep the same Date, just change Time.
        const newStart = new Date(oldStart);
        newStart.setUTCHours(4, 0, 0, 0); // 04:00 UTC = 13:00 KST

        const newEnd = new Date(newStart);
        newEnd.setMinutes(newEnd.getMinutes() + 30); // 30 min duration

        await prisma.rESERVATIONS.update({
            where: { reservation_id: res.reservation_id },
            data: {
                start_time: newStart,
                end_time: newEnd
            }
        });
        console.log(`Updated Reservation ${res.reservation_id}: ${oldStart.toISOString()} -> ${newStart.toISOString()}`);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
