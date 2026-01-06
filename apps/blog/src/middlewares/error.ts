import { ClientError, fail } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";

export const errorHandler = (err: unknown, req: Request, res: Response, _: NextFunction) => {
        console.error(err);

        if (err instanceof ClientError) {
                return res.status(err.statusCode).json(fail(err.message));
        }

        // fallback
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(fail("Oops! something went wrong"));
};
