import { ok, PaginationFilter, PaginationFilterSchema, slugify } from "@repo/shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { CreateProduct, deleteProductById, getAllProducts, getProductById, insertProduct, Product, ProductFilter, ProductFilterSchema, updateProduct } from "../models/product-model";

export const postProducts = async (req: Request, res: Response) => {

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

        const product = await insertProduct(createProduct);
        res.status(StatusCodes.CREATED).json(ok("Product added successfully", product));
}

export const getProducts = async (req: Request, res: Response) => {
        const filter: ProductFilter = ProductFilterSchema.parse(req.query);
        const pFilter: PaginationFilter = PaginationFilterSchema.parse(req.query);

        const response = await getAllProducts(filter, pFilter);
        res.status(StatusCodes.OK).json(ok("Products fetched successfully", response));
}

export const getProductsById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const product = await getProductById(Number(id));


        res.status(StatusCodes.OK).json(ok("Product fetched successfully", product));
}

export const updateProductsById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, desc, price, stock, status } = req.body;

        const product = await getProductById(Number(id));

        const updateData: Product = {
                ...product,
                name: name ?? product.name,
                desc: desc ?? product.desc,
                price: price ?? product.price,
                stock: stock ?? product.stock,
                status: status ?? product.status,
                updated_at: new Date(),
        };

        const updated = await updateProduct(updateData);

        res.status(StatusCodes.OK).json(ok("Product updated successfully", updated));
}


export const deleteProductsById = async (req: Request, res: Response) => {
        const { id } = req.params;
        await getProductById(Number(id));
        const product = await deleteProductById(Number(id));

        res.status(StatusCodes.OK).json(ok("Product deleted successfully", product));
}
