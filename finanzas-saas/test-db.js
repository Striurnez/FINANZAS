const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
    try {
        const users = await prisma.user.findMany();
        console.log('USERS_COUNT:', users.length);
        console.log('USERS_LIST:', JSON.stringify(users, null, 2));
    } catch (e) {
        console.error('DB_ERROR:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
