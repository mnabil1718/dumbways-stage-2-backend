import { ROLE } from "../generated/prisma/enums";
import { prisma } from "./prisma";

async function main() {
        // ======================
        // CLEAN UP (ORDER MATTERS)
        // ======================
        await prisma.$executeRaw`
    TRUNCATE TABLE
      "Stock",
      "Supplier",
      "Product",
      "User",
      "Stock"
    RESTART IDENTITY CASCADE;
  `;

        // ======================
        // USERS
        // ======================
        await prisma.user.createMany({
                data: [
                        {
                                email: "alice@example.com",
                                name: "Alice Johnson",
                                password: "hashed_password_alice",
                                balance: 100,
                                role: ROLE.ADMIN,
                        },
                        {
                                email: "bob@example.com",
                                name: "Bob Smith",
                                password: "hashed_password_bob",
                                balance: 50,
                                role: ROLE.USER,
                        },
                        {
                                email: "charlie@example.com",
                                name: "Charlie Brown",
                                password: "hashed_password_charlie",
                                balance: 370,
                                role: ROLE.USER,
                        },
                ],
        });

        // ======================
        // PRODUCTS
        // ======================
        const products = await prisma.product.createMany({
                data: [
                        { name: "Beras 5kg", sku: "BR-5KG" },
                        { name: "Gula 1kg", sku: "GL-1KG" },
                ],
        });

        // ======================
        // SUPPLIERS
        // ======================
        const suppliers = await prisma.supplier.createMany({
                data: [
                        {
                                name: "Supplier A",
                                email: "supplierA@example.com",
                                password: "hashed_supplier_a",
                                role: ROLE.ADMIN,
                        },
                        {
                                name: "Supplier B",
                                email: "supplierB@example.com",
                                password: "hashed_supplier_b",
                                role: ROLE.USER,
                        },
                ],
        });


        // ======================
        // FETCH IDS (IMPORTANT)
        // ======================
        const productList = await prisma.product.findMany();
        const supplierList = await prisma.supplier.findMany();

        const beras = productList.find(p => p.sku === "BR-5KG")!;
        const gula = productList.find(p => p.sku === "GL-1KG")!;

        const supplierA = supplierList.find(s => s.email === "supplierA@example.com")!;
        const supplierB = supplierList.find(s => s.email === "supplierB@example.com")!;

        // ======================
        // STOCKS
        // ======================
        await prisma.stock.createMany({
                data: [
                        // Beras
                        {
                                productId: beras.id,
                                supplierId: supplierA.id,
                                qty: 20,
                        },
                        {
                                productId: beras.id,
                                supplierId: supplierB.id,
                                qty: 15,
                        },

                        // Gula
                        {
                                productId: gula.id,
                                supplierId: supplierA.id,
                                qty: 30,
                        },
                ],
        });

        console.log("Seeding completed successfully");
}

main()
        .catch((e) => {
                console.error("Seeding failed:", e);
                process.exit(1);
        })
        .finally(async () => {
                await prisma.$disconnect();
        });
