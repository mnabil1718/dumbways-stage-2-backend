import { Request, Response } from "express";
import { hash, ok, compare, AuthenticationError, generateJWT } from "@repo/shared";
import { CreateUser, getUserByEmail, insertUser, updateUserPasswordById, User } from "../models/user-model";
import { StatusCodes } from "http-status-codes";
import { JWT_SECRET } from "../utils/tokenize";
import { generateResetToken, hashResetToken } from "../utils/password-token";
import { prisma } from "../lib/prisma";
import { TOKEN_SCOPE } from "../generated/prisma/enums";
import { getToken, insertToken, Token } from "../models/token-model";

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

export const postResetUsersPassword = async (req: Request, res: Response) => {
        const { email } = req.body;

        const u: User = await getUserByEmail(email);
        const { raw, hashed } = generateResetToken();

        await insertToken({
                token: hashed,
                scope: TOKEN_SCOPE.RESET,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // ms 
                userId: u.id,
        });

        res.status(StatusCodes.OK).json(ok("Reset request successful", { token: raw }));
}

export const putUsersPassword = async (req: Request, res: Response) => {

        const { token, password } = req.body;

        const hashed = hashResetToken(token);
        const t: Token = await getToken(hashed, TOKEN_SCOPE.RESET);
        const new_hashed_password = await hash(password);
        await updateUserPasswordById(t.userId, new_hashed_password);

        res.status(StatusCodes.OK).json(ok("Password updated successfully. Please log in"));
}
