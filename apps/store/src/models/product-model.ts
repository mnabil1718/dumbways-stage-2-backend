import { calcLastId, NotFoundError } from "@repo/shared";
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


export type CreateProduct = Omit<Product, "id">;

export const CreateProductSchema = z.object({
        name: z.string().min(1),
        desc: z.string().min(1).max(350),
        price: z.number().gte(1),
        stock: z.number().nonnegative(),
        status: z.enum(PRODUCT_STATUS),
});

export const UpdateProductSchema = CreateProductSchema.partial();

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

export async function getProductById(id: number): Promise<Product> {
        return await prisma.product.findUniqueOrThrow({
                where: {
                        id,
                },
        });
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
