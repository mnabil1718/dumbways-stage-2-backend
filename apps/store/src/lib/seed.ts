import { PRODUCT_STATUS } from "../../generated/prisma/enums";
import { prisma } from "./prisma";

async function main() {
        await prisma.product.deleteMany();

        const products = await prisma.product.createMany({
                data: [
                        {
                                name: "Mechanical Keyboard",
                                slug: "mechanical-keyboard",
                                desc: "RGB mechanical keyboard with blue switches and aluminium frame.",
                                price: 149.99,
                                stock: 25,
                                status: PRODUCT_STATUS.ACTIVE,
                                created_at: new Date("2025-12-20T08:00:00Z"),
                                updated_at: new Date("2025-12-20T08:00:00Z"),
                        },
                        {
                                name: "Wireless Mouse",
                                slug: "wireless-mouse",
                                desc: "Ergonomic wireless mouse with adjustable DPI and long battery life.",
                                price: 39.99,
                                stock: 100,
                                status: PRODUCT_STATUS.DRAFT,
                                created_at: new Date("2025-12-22T10:30:00Z"),
                                updated_at: new Date("2025-12-22T10:30:00Z"),
                        },
                        {
                                name: "Gaming Monitor",
                                slug: "gaming-monitor",
                                desc: "27-inch 144Hz gaming monitor with 1ms response time.",
                                price: 299.99,
                                stock: 50,
                                status: PRODUCT_STATUS.ACTIVE,
                                created_at: new Date("2025-12-23T09:00:00Z"),
                                updated_at: new Date("2025-12-23T09:00:00Z"),
                        },
                        {
                                name: "USB-C Hub",
                                slug: "usb-c-hub",
                                desc: "Multiport USB-C hub with HDMI, USB-A, and SD card reader.",
                                price: 49.99,
                                stock: 75,
                                status: PRODUCT_STATUS.INACTIVE,
                                created_at: new Date("2025-12-24T12:00:00Z"),
                                updated_at: new Date("2025-12-24T12:00:00Z"),
                        },
                ],
        });
}

main()
        .then(() => {
                console.log("Seeding completed...");
        })
        .catch((e) => {
                console.error(e);
        })
        .finally(async () => {
                await prisma.$disconnect();
        });
