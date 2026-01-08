import { ok } from "@repo/shared";
import { Category, checkCategoryIDExists, deleteCategoryById, getCategoryById, insertCategory, UpdateCategory, updateCategory } from "../models/category-model";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const postCategories = async (req: Request, res: Response) => {
        const { name } = req.body;

        const category = await insertCategory({ name });
        res.status(StatusCodes.CREATED).json(ok("Category created successfully", category));
}

export const putCategories = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name } = req.body;
        const cId: number = Number(id);

        const c: Category = await getCategoryById(cId);

        const data: UpdateCategory = {
                id: cId,
                name: name ?? c.name,
        };

        const updated = await updateCategory(data);
        res.status(StatusCodes.OK).json(ok("Category updated successfully", updated));
}

export const getCategoriesById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const c = await getCategoryById(Number(id));

        res.status(StatusCodes.OK).json(ok("Category fetched successfully", c));
}

export const deleteCategoriesById = async (req: Request, res: Response) => {
        const { id } = req.params;

        await checkCategoryIDExists(Number(id));
        const c = await deleteCategoryById(Number(id));
        res.status(StatusCodes.OK).json(ok("Category deleted successfully", c));
}
