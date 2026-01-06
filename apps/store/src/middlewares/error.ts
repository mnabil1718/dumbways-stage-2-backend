import { ClientError } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (err: unknown, req: Request, res: Response, next: NextFunction) => {
        if (err instanceof ClientError) {
                return res.status(err.statusCode).json({ message: err.message });
        }

        // fallback
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ message: "Oops! Something went wrong" });
};
