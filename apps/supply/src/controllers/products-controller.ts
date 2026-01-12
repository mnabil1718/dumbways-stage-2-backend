import { ok } from "@repo/shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { checkProductIDExists, deleteProductById, getAllProducts, getProductById, insertProduct, updateProduct, UpdateProduct } from "../models/product-model";

export const postProducts = async (req: Request, res: Response) => {
        const p = await insertProduct(req.body);
        res.status(StatusCodes.CREATED).json(ok("Product created successfully", p));
}

export const putProducts = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, sku, price } = req.body;

        const num_id = Number(id);

        await checkProductIDExists(num_id);

        const update: UpdateProduct = {
                id: num_id,
                name,
                sku,
                price,
        };

        const updated = await updateProduct(update);
        res.status(StatusCodes.OK).json(ok("Product updated successfully", updated));
}

export const getProducts = async (req: Request, res: Response) => {
        const products = await getAllProducts();
        res.status(StatusCodes.OK).json(ok("Products fetched successfully", products));
}

export const getProductsById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const p = await getProductById(Number(id));

        res.status(StatusCodes.OK).json(ok("Product fetched successfully", p));
}

export const deleteProductsById = async (req: Request, res: Response) => {
        const { id } = req.params;

        await checkProductIDExists(Number(id));
        const p = await deleteProductById(Number(id));
        res.status(StatusCodes.OK).json(ok("Product deleted successfully", p));
}

export const postProductsImage = async (req: Request, res: Response) => {
        console.log(req.file);
}
