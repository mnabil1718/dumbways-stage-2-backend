import z from "zod";
import { prisma } from "../lib/prisma";
import { checkSupplierIDsExists } from "./supplier-model";
import { Prisma } from "../generated/prisma/client";
import { Product } from "./product-model";


export interface StocksWithProducts {
        id: number;
        supplierId: number;
        productId: number;

}

export const UpdateStockItemSchema = z.object({
        supplierId: z.int().gt(0),
        qty: z.int().nonnegative(),
});

export const UpdateStockSchema = z.object({
        productId: z.int().gt(0),
        updates: z.array(UpdateStockItemSchema).min(1),
}).superRefine((data, ctx) => {

        // No duplicate supplierId
        const seen = new Set<number>();
        const updates = data.updates;
        updates.forEach((element, idx) => {
                if (seen.has(element.supplierId)) {
                        ctx.addIssue({
                                code: 'custom',
                                message: `supplierId ${element.supplierId} is duplicated`,
                                path: ["updates", idx],
                        });
                } else {
                        seen.add(element.supplierId);
                }
        });
});

export type UpdateStock = z.infer<typeof UpdateStockSchema>;



export async function updateSupplierStock(data: UpdateStock): Promise<UpdateStock> {

        const ids: number[] = data.updates.map(i => i.supplierId);

        await prisma.$transaction(async (tx) => {

                await checkSupplierIDsExists(tx, ids);

                const values: Prisma.Sql[] = data.updates.map((u) => {
                        return Prisma.sql`(${data.productId}::int,${u.supplierId}::int,${u.qty}::int)`;
                });

                // create temporary table (CTE) to store list of updates
                const cte = Prisma.sql`WITH updates ("productId", "supplierId", qty) 
				       AS (VALUES ${Prisma.join(values, ",")})`;

                await tx.$executeRaw`
					${cte}
					UPDATE "Stock" s
					SET qty = u.qty
					FROM updates u
					WHERE u."productId" = s."productId"
					AND u."supplierId" = s."supplierId";
				    `;
        });

        return data;
}


export async function getProductsBySupplierID(supplierId: number): Promise<void> {
        const stocks = await prisma.stock.findMany({
                where: {
                        supplierId,
                },
                include: {
                        product: true,
                },
        });

        console.log(stocks);

}
