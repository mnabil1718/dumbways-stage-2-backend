import { prisma } from "./prisma";

async function main() {
        // Clean up (order matters because of relations)
        await prisma.categoriesOnPosts.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.category.deleteMany();
        await prisma.post.deleteMany();
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

        // Fetch users to get their IDs
        const allUsers = await prisma.user.findMany();

        const alice = allUsers.find(u => u.email === "alice@example.com")!;
        const bob = allUsers.find(u => u.email === "bob@example.com")!;
        const charlie = allUsers.find(u => u.email === "charlie@example.com")!;

        // Create categories
        await prisma.category.createMany({
                data: [
                        { name: "Prisma" },
                        { name: "TypeScript" },
                        { name: "PostgreSQL" },
                        { name: "Linux" },
                        { name: "Backend" },
                ],
                skipDuplicates: true,
        });

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

        // Fetch posts to get their IDs
        const allPosts = await prisma.post.findMany();

        const prismaPost = allPosts.find(p => p.slug === "getting-started-with-prisma")!;
        const tsPost = allPosts.find(p => p.slug === "typescript-backend-tips")!;
        const pgPost = allPosts.find(p => p.slug === "why-i-love-postgresql")!;

        // Create comments (SAFE: users + posts already exist)
        await prisma.comment.createMany({
                data: [
                        {
                                content: "Great introduction! Prisma is awesome.",
                                userId: bob.id,
                                postId: prismaPost.id,
                        },
                        {
                                content: "Helped me a lot, thanks!",
                                userId: charlie.id,
                                postId: prismaPost.id,
                        },
                        {
                                content: "Nice tips, especially about types.",
                                userId: bob.id,
                                postId: tsPost.id,
                        },
                        {
                                content: "PostgreSQL gang 💪",
                                userId: alice.id,
                                postId: pgPost.id,
                        },
                ],
        });
}

main()
        .then(() => {
                console.log("Seeding completed (users, posts, comments)...");
        })
        .catch((e) => {
                console.error(e);
                process.exit(1);
        })
        .finally(async () => {
                await prisma.$disconnect();
        });
