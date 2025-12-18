import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
    const sqlPath = path.join(__dirname, '../sql/01_test_data.sql');
    console.log(`Reading SQL file from: ${sqlPath}`);

    const sqlContent = fs.readFileSync(sqlPath, 'utf8');

    // Split by semicolon, but be careful about semicolons inside strings if any.
    // For this specific file, splitting by newline + semicolon might be safer or just by semicolon.
    // The file structure shows statements ending with ;
    const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);

    console.log(`Found ${statements.length} statements.`);

    for (const statement of statements) {
        try {
            // Skip comments
            if (statement.startsWith('--')) {
                const lines = statement.split('\n');
                const realSql = lines.filter(line => !line.trim().startsWith('--')).join('\n').trim();
                if (!realSql) continue;
                await prisma.$executeRawUnsafe(realSql);
            } else {
                await prisma.$executeRawUnsafe(statement);
            }
        } catch (e) {
            console.error('Error executing statement:', statement.substring(0, 50) + '...');
            console.error(e);
        }
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
