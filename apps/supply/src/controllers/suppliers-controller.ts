import { Request, Response } from "express";
import { hash, ok } from "@repo/shared";
import { StatusCodes } from "http-status-codes";
import { checkSupplierIDExists, CreateSupplier, deleteSupplierById, getAllSuppliers, getSupplierById, insertSupplier, mapToResponse, Supplier, updateSupplier, UpdateSupplier } from "../models/supplier-model";
import { getProductsBySupplierID, updateSupplierStock } from "../models/stock-model";
import { getProductById } from "../models/product-model";

export const postSuppliers = async (req: Request, res: Response) => {

        const { name, email, password, role } = req.body;

        const hashed = await hash(password);

        const create: CreateSupplier = {
                name,
                email,
                password: hashed,
                role,
        };

        const u = await insertSupplier(create);
        res.status(StatusCodes.CREATED).json(ok("Supplier created successfully", u));
}

export const putSuppliers = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, email, password, role } = req.body;

        const num_id = Number(id);

        const s: Supplier = await getSupplierById(num_id);

        if (password) {
                s.password = await hash(password);
        }

        const update: UpdateSupplier = {
                id: s.id,
                name: name ?? s.name,
                email: email ?? s.email,
                password: s.password,
                role: role ?? s.role,
        };

        const updated = await updateSupplier(update);
        res.status(StatusCodes.OK).json(ok("Supplier updated successfully", updated));
}

export const getSuppliers = async (req: Request, res: Response) => {
        const suppliers = await getAllSuppliers();
        res.status(StatusCodes.OK).json(ok("Suppliers fetched successfully", suppliers));
}

export const getSuppliersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const s = await getSupplierById(Number(id));

        res.status(StatusCodes.OK).json(ok("Supplier fetched successfully", mapToResponse(s)));
}

export const deleteSuppliersById = async (req: Request, res: Response) => {
        const { id } = req.params;

        await checkSupplierIDExists(Number(id));
        const s = await deleteSupplierById(Number(id));
        res.status(StatusCodes.OK).json(ok("Supplier deleted successfully", s));
}


export const batchUpdateSuppliersStock = async (req: Request, res: Response) => {
        await getProductById(req.body.productId);
        const update = await updateSupplierStock(req.body);
        res.status(StatusCodes.OK).json(ok("Stocks update successfully", update));
}

export const getSuppliersProducts = async (req: Request, res: Response) => {

        const { sub } = (req as any).user;

        await getProductsBySupplierID(Number(sub));
}
