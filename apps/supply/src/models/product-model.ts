import z from "zod";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "@repo/shared";

export interface Product {
        id: number;
        name: string;
        sku: string;
        createdAt: Date;
        updatedAt: Date;
}

// =========  CREATE  ============


export const CreateProductSchema = z.object({
        name: z.string().min(3),
        sku: z.string().min(3),
});

export type CreateProduct = z.infer<typeof CreateProductSchema>;


// =========  UPDATE  ============

export const UpdateProductSchema = CreateProductSchema.partial();

export type UpdateProduct = z.infer<typeof UpdateProductSchema> & { id: number; };




export async function insertProduct(data: CreateProduct): Promise<Product> {
        return await prisma.product.create({
                data: {
                        name: data.name,
                        sku: data.sku,
                },
        });
}

export async function updateProduct(data: UpdateProduct): Promise<Product> {
        return await prisma.product.update({
                where: {
                        id: data.id,
                },
                data: {
                        name: data.name,
                        sku: data.sku,
                        updatedAt: new Date(),
                },
        });
}

export async function getAllProducts(): Promise<Product[]> {
        return await prisma.product.findMany();
};


export async function getProductById(id: number): Promise<Product> {
        const product = await prisma.product.findUnique({
                where: {
                        id,
                },
        });

        if (!product) throw new NotFoundError("Product not found");
        return product;
};


export async function deleteProductById(id: number): Promise<Product> {
        return await prisma.product.delete({
                where: {
                        id,
                },
        });
}

export async function checkProductIDExists(id: number): Promise<void> {
        const p = await prisma.product.findUnique({
                where: {
                        id,
                },
        });

        if (!p) throw new NotFoundError("Product not found");
}
