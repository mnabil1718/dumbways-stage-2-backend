import { Request, Response } from "express";
import { ok, compare, AuthenticationError, generateJWT } from "@repo/shared";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "../utils/tokenize";
import { getSupplierByEmail, Supplier } from "../models/supplier-model";


export const loginSuppliers = async (req: Request, res: Response) => {

        const { email, password } = req.body;

        const s: Supplier = await getSupplierByEmail(email);
        const ok_password = await compare(password, s.password);
        if (!ok_password) throw new AuthenticationError("invalid credentials");

        const accessToken: string = await generateJWT({ sub: String(s.id), role: s.role }, JWT_SECRET);

        res.status(StatusCodes.OK).json(ok("Supplier logged in successfully.", { accessToken }));
}
