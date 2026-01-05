import { slugify } from "@repo/shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateProduct, deleteProductById, getAllProducts, getProductById, insertProduct, Product, updateProduct } from "../models/product-model";

export const postProducts = (req: Request, res: Response) => {

        const { name, desc, price, stock, status } = req.body;
        const now = new Date();
        const slug: string = slugify(name);

        const createProduct: CreateProduct = {
                name,
                desc,
                price,
                stock,
                status,
                slug,
                created_at: now,
                updated_at: now,
        };

        const product = insertProduct(createProduct);
        res.status(StatusCodes.CREATED).json(product);
}

export const getProducts = (req: Request, res: Response) => {
        const products = getAllProducts();
        res.status(StatusCodes.OK).json(products);
}

export const getProductsById = (req: Request, res: Response) => {
        const { id } = req.params;
        const product = getProductById(Number(id));


        res.status(StatusCodes.OK).json(product);
}

export const updateProductsById = (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, desc, price, stock, status } = req.body;

        const product = getProductById(Number(id));

        const updateData: Product = {
                ...product,
                name: !name ? product.name : name,
                desc: !desc ? product.desc : desc,
                price: !price ? product.price : price,
                stock: !stock ? product.stock : stock,
                status: !status ? product.status : status,
                updated_at: new Date(),
        };

        const updated = updateProduct(updateData);

        res.status(StatusCodes.OK).json(updated);
}


export const deleteProductsById = (req: Request, res: Response) => {
        const { id } = req.params;
        const product = deleteProductById(Number(id));

        res.status(StatusCodes.OK).json(product);
}
