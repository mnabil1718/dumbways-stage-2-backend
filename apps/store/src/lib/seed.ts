import {
        ORDER_STATUS,
        PAYMENT_METHOD,
        PRODUCT_STATUS,
} from "../../generated/prisma/enums";
import { prisma } from "./prisma";

async function main() {
        /* -----------------------------
         * PRODUCTS
         * ----------------------------- */
        await prisma.product.deleteMany();

        await prisma.product.createMany({
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

        // ⬅️ IMPORTANT: fetch AFTER seeding
        const products = await prisma.product.findMany({
                orderBy: { id: "asc" },
        });

        await seedOrders(products);
}

async function seedOrders(products: any[]) {
        /* -----------------------------
         * CLEAN ORDER DATA
         * ----------------------------- */
        await prisma.orderItem.deleteMany();
        await prisma.order.deleteMany();
        await prisma.shippingAddress.deleteMany();

        if (products.length < 3) {
                throw new Error("Not enough products to seed orders.");
        }

        const address = await prisma.shippingAddress.create({
                data: {
                        recipient_name: "John Doe",
                        street: "Jl. Sudirman No. 10",
                        city: "Jakarta",
                        province: "DKI Jakarta",
                        postal_code: "10220",
                        country: "Indonesia",
                        phone: "+62 812 3456 7890",
                },
        });

        const items = [
                { product: products[0], qty: 2 },
                { product: products[1], qty: 1 },
        ];

        const total = items.reduce(
                (sum, i) => sum + i.product.price * i.qty,
                0
        );

        await prisma.order.create({
                data: {
                        shipping_address_id: address.id,
                        payment_method: PAYMENT_METHOD.CREDIT_CARD,
                        status: ORDER_STATUS.PROCESSING,
                        total_amount: total,
                        items: {
                                create: items.map((i) => ({
                                        product_id: i.product.id,
                                        product_name: i.product.name,
                                        product_price: i.product.price,
                                        qty: i.qty,
                                        subtotal: i.product.price * i.qty,
                                })),
                        },
                },
        });

        console.log("Orders & shipping seeded ✅");
}

main()
        .then(() => console.log("Seeding completed 🚀"))
        .catch(console.error)
        .finally(async () => {
                await prisma.$disconnect();
        });
