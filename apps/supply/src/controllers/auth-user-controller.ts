import { Request, Response } from "express";
import { hash, ok, compare, AuthenticationError, generateJWT } from "@repo/shared";
import { CreateUser, getUserByEmail, insertUser, User } from "../models/user-model";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "../utils/tokenize";

export const registerUsers = async (req: Request, res: Response) => {

        const { name, email, password, balance, role } = req.body;

        const hashed = await hash(password);

        const create: CreateUser = {
                name,
                email,
                password: hashed,
                balance: balance ?? 0,
                role,
        };

        const u = await insertUser(create);
        res.status(StatusCodes.CREATED).json(ok("User registered successfully. Please log in", u));
}


export const loginUsers = async (req: Request, res: Response) => {

        const { email, password } = req.body;

        const user: User = await getUserByEmail(email);

        const ok_password = await compare(password, user.password);

        if (!ok_password) throw new AuthenticationError("invalid credentials");

        const accessToken: string = await generateJWT({ sub: String(user.id), role: user.role }, JWT_SECRET);

        res.status(StatusCodes.OK).json(ok("User logged in successfully.", { accessToken }));
}
