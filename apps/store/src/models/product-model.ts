import { NotFoundError } from "@repo/shared";
import z from "zod";
import { PRODUCT_STATUS } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { ProductOrderByWithRelationInput, ProductWhereInput } from "../../generated/prisma/models";
import { buildPaginationQuery, calculatePaginationMetadata, PaginationFilter, PaginationMetadata } from "@repo/shared";

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

export interface PaginatedProducts {
        products: Product[];
        medatada?: PaginationMetadata;
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
        max_price: z.coerce.number().nonnegative().optional(),
        min_price: z.coerce.number().nonnegative().optional(),
        max_stock: z.coerce.number().nonnegative().optional(),
        min_stock: z.coerce.number().nonnegative().optional(),
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

        if (data.order !== undefined && data.sort === undefined) {
                ctx.addIssue({
                        path: ["sort"],
                        message: "sort have to be specified",
                        code: "custom",
                });
        }
});

export type ProductFilter = z.infer<typeof ProductFilterSchema>;

function buildWhere(filter: ProductFilter): ProductWhereInput {
        const where: ProductWhereInput = {};
        if (filter.min_price !== undefined || filter.max_price !== undefined) {
                where.price = {
                        gte: filter.min_price,
                        lte: filter.max_price,
                };
        }

        if (filter.min_stock !== undefined || filter.max_stock !== undefined) {
                where.stock = {
                        gte: filter.min_stock,
                        lte: filter.max_stock,
                };
        }

        return where;
}

function buildSort(filter: ProductFilter): ProductOrderByWithRelationInput | undefined {
        if (!filter.sort) return;
        return {
                [filter.sort]: filter.order ?? "desc",
        };
}



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

export async function getAllProducts(filter: ProductFilter, pFilter: PaginationFilter): Promise<PaginatedProducts> {
        const pagination = buildPaginationQuery(pFilter);
        const products = await prisma.product.findMany({
                where: buildWhere(filter),
                orderBy: buildSort(filter),
                ...pagination,
        });
        const total_items = await prisma.product.count({
                where: buildWhere(filter),
                orderBy: buildSort(filter),
        });

        return {
                products,
                metadata: calculatePaginationMetadata(pFilter, total_items),
        } as PaginatedProducts;
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
