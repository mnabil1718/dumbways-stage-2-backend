import { prisma } from "./prisma";

async function main() {
        // Clean up (order matters because of relations)
        // This one empty User table and reset AUTO INCREMENT back to 1
        await prisma.$executeRaw`TRUNCATE TABLE "User" RESTART IDENTITY CASCADE;`;

        // Create users
        await prisma.user.createMany({
                data: [
                        {
                                email: "alice@example.com",
                                name: "Alice Johnson",
                                password: "hashed_password_alice",
                                balance: 100,
                        },
                        {
                                email: "bob@example.com",
                                name: "Bob Smith",
                                password: "hashed_password_bob",
                                balance: 50,
                        },
                        {
                                email: "charlie@example.com",
                                name: "Charlie Brown",
                                password: "hashed_password_charlie",
                                balance: 370,
                        },
                ],
        });

}

main()
        .then(() => {
                console.log("Seeding completed data...");
        })
        .catch((e) => {
                console.error(e);
                process.exit(1);
        })
        .finally(async () => {
                await prisma.$disconnect();
        });
