import { AuthenticationError, JwtPayload, verifyJWT } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { JWT_SECRET } from "../utils/tokenize";

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
        const auth_header = req.headers.authorization;
        const jwt = auth_header && auth_header.split(' ')[1];

        if (!jwt) {
                throw new AuthenticationError("auth token is missing");
        }

        const payload: JwtPayload = await verifyJWT(jwt, JWT_SECRET);

        (req as any).user = payload;
        next();
        }
