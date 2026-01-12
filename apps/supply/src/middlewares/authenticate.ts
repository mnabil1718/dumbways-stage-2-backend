import { AuthenticationError, AuthorizationError, JwtPayload, verifyJWT } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../utils/tokenize";
import { ROLE } from "../generated/prisma/enums";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
        const auth_header = req.headers.authorization;
        const jwt = auth_header && auth_header.split(' ')[1];

        if (!jwt) {
                throw new AuthenticationError("auth token is missing");
        }

        const payload: JwtPayload = await verifyJWT(jwt, JWT_SECRET);

        // for both supplier and user
        (req as any).user = { id: Number(payload.sub), role: payload.role };
        next();
}

export const authorizeAdmin = async (req: Request, res: Response, next: NextFunction) => {

        const { role } = (req as any).user;

        if (role !== ROLE.ADMIN) throw new AuthorizationError("you are not autorized to perform this action");

        next();
        }
