import { prisma } from "./prisma";

async function main() {
        // Clean up (order matters because of relations)
        await prisma.user.deleteMany();

        // Create users
        await prisma.user.createMany({
                data: [
                        {
                                email: "alice@example.com",
                                name: "Alice Johnson",
                                password: "hashed_password_alice",
                        },
                        {
                                email: "bob@example.com",
                                name: "Bob Smith",
                                password: "hashed_password_bob",
                        },
                        {
                                email: "charlie@example.com",
                                name: "Charlie Brown",
                                password: "hashed_password_charlie",
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
