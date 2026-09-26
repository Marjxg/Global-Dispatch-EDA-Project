import { prisma } from "../config/database.js";

async function main() {
    await prisma.$connect();

    const result = await prisma.order.count();

    console.log("PostgreSQL connected successfully.");
    console.log("Orders in database:", result);
}

main()
    .catch((error) => {
        console.error(error);
        process.exitCode = 1;
    })
    .finally(async () => {
        await prisma.$disconnect();
    });