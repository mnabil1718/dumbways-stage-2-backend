import { NotFoundError } from "@repo/shared";
import z from "zod";
import { PRODUCT_STATUS } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";

export interface Product {
        id: number;
        name: string;
        slug: string;
        desc: string;
        price: number;
        stock: number;
        status: PRODUCT_STATUS;
        created_at: Date;
        updated_at: Date;
}


// =========  CREATE  ============

export type CreateProduct = Omit<Product, "id">;

export const CreateProductSchema = z.object({
        name: z.string().min(1),
        desc: z.string().min(1).max(350),
        price: z.number().gte(1),
        stock: z.number().nonnegative(),
        status: z.enum(PRODUCT_STATUS),
});

// =========  UPDATE  ============

export const UpdateProductSchema = CreateProductSchema.partial();


// =========  FILTERS ============

// number fields are coerced because it
// will initially be string from req.query
export const ProductFilterSchema = z.object({
        order: z.literal(["desc", "asc"]).optional(),
        sort: z.literal(["price", "stock"]).optional(),
        max_price: z.coerce.number().gte(0).optional(),
        min_price: z.coerce.number().gte(0).optional(),
        max_stock: z.coerce.number().gte(0).optional(),
        min_stock: z.coerce.number().gte(0).optional(),
        page: z.coerce.number().gte(1).optional(),
        limit: z.coerce.number().gte(0).lte(100).optional(),
}).superRefine((data, ctx) => {
        if (data.min_price !== undefined && data.max_price !== undefined && data.min_price > data.max_price) {
                ctx.addIssue({
                        path: ["max_price"],
                        message: "min_price cannot be greater than max_price",
                        code: "custom",
                });
        }

        if (data.min_stock !== undefined && data.max_stock !== undefined && data.min_stock > data.max_stock) {
                ctx.addIssue({
                        path: ["max_stock"],
                        message: "min_stock cannot be greater than max_stock",
                        code: "custom",
                });
        }
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;


export async function insertProduct(data: CreateProduct): Promise<Product> {
        return await prisma.product.create({
                data: {
                        name: data.name,
                        slug: data.slug,
                        desc: data.desc,
                        price: data.price,
                        stock: data.stock,
                        status: data.status,
                        created_at: data.created_at,
                        updated_at: data.updated_at,
                },
        });
}

export async function updateProduct(product: Product): Promise<Product> {
        return await prisma.product.update({
                where: {
                        id: product.id,
                },
                data: {
                        name: product.name,
                        desc: product.desc,
                        price: product.price,
                        stock: product.stock,
                        status: product.status,
                        updated_at: product.updated_at,
                },
        });
}

export async function getAllProducts(): Promise<Product[]> {
        return await prisma.product.findMany();
};

export async function getProductsByIds(ids: number[]): Promise<Product[]> {
        return await prisma.product.findMany({
                where: {
                        id: {
                                in: ids,
                        },
                },
        });
}

export async function getProductById(id: number): Promise<Product> {
        const product = await prisma.product.findUnique({
                where: {
                        id,
                },
        });

        // custom not found error instead of prisma's
        if (!product) throw new NotFoundError("Product not found");
        return product;
};

export async function getProductBySlug(slug: string): Promise<Product> {
        return await prisma.product.findUniqueOrThrow({
                where: {
                        slug,
                },
        });
};

export async function deleteProductById(id: number): Promise<Product> {
        return await prisma.product.delete({
                where: {
                        id,
                },
        });
}
