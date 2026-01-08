import z from "zod";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "@repo/shared";

export interface Category {
        id: number;
        name: string;
}


// ======= CREATE ========

export const CreateCategorySchema = z.object({
        name: z.string().min(1).max(150),
});

export type CreateCategory = z.infer<typeof CreateCategorySchema>;

// ======= UPDATE ========

export const UpdateCategorySchema = CreateCategorySchema.partial();

export type UpdateCategory = z.infer<typeof UpdateCategorySchema> & { id: number };


export async function insertCategory(data: CreateCategory): Promise<Category> {
        return await prisma.category.create({
                data: {
                        name: data.name,
                },
        });
}


export async function updateCategory(data: UpdateCategory): Promise<Category> {
        return await prisma.category.update({
                where: {
                        id: data.id,
                },
                data: {
                        name: data.name,
                },
        });
}


export async function getCategoryById(id: number): Promise<Category> {
        const c = await prisma.category.findUnique({
                where: {
                        id,
                },
        });

        if (!c) throw new NotFoundError("Category not found");
        return c;
}


export async function deleteCategoryById(id: number): Promise<Category> {
        return await prisma.category.delete({
                where: {
                        id,
                },
        });
}

export async function checkCategoryIDExists(id: number): Promise<void> {
        const c = await prisma.category.findUnique({
                where: {
                        id,
                },
        });

        if (!c) throw new NotFoundError("Category not found");
}
