import { prisma } from "./prisma";

async function main() {
        // Clean up (order matters because of relations)
        await prisma.post.deleteMany();
        await prisma.user.deleteMany();

        // Create users
        const users = await prisma.user.createMany({
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

        // Fetch users to get their IDs
        const allUsers = await prisma.user.findMany();

        const alice = allUsers.find(u => u.email === "alice@example.com")!;
        const bob = allUsers.find(u => u.email === "bob@example.com")!;
        const charlie = allUsers.find(u => u.email === "charlie@example.com")!;

        // Create posts
        await prisma.post.createMany({
                data: [
                        {
                                slug: "getting-started-with-prisma",
                                title: "Getting Started with Prisma",
                                content: "This post explains how to get started with Prisma ORM.",
                                published: true,
                                authorId: alice.id,
                        },
                        {
                                slug: "typescript-backend-tips",
                                title: "TypeScript Backend Tips",
                                content: "Best practices for building scalable backends with TypeScript.",
                                published: true,
                                authorId: alice.id,
                        },
                        {
                                slug: "why-i-love-postgresql",
                                title: "Why I Love PostgreSQL",
                                content: "PostgreSQL is powerful, open source, and production ready.",
                                published: false,
                                authorId: bob.id,
                        },
                        {
                                slug: "linux-for-web-developers",
                                title: "Linux for Web Developers",
                                content: "Why Linux is a great choice for modern web development.",
                                published: true,
                                authorId: charlie.id,
                        },
                ],
        });
}

main()
        .then(() => {
                console.log("User & Post seeding completed...");
        })
        .catch((e) => {
                console.error(e);
                process.exit(1);
        })
        .finally(async () => {
                await prisma.$disconnect();
        });
