import { ClientError, fail } from "@repo/shared";
import { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Prisma } from "../generated/prisma/client";
import multer from "multer";

export const errorHandler = (err: unknown, req: Request, res: Response, _: NextFunction) => {
        console.error(err);

        if (err instanceof ClientError) {
                return res.status(err.statusCode).json(fail(err.message));
        }

        if (err instanceof Prisma.PrismaClientKnownRequestError) {
                switch (err.code) {
                        case "P2002": {
                                // unique constraint violation
                                return res
                                        .status(StatusCodes.CONFLICT)
                                        .json(fail("Resource already exists"));
                        }

                        case "P2025": {
                                // record not found
                                return res
                                        .status(StatusCodes.NOT_FOUND)
                                        .json(fail("Resource not found"));
                        }

                        default:
                                return res
                                        .status(StatusCodes.BAD_REQUEST)
                                        .json(fail("Database error"));
                }
        }

        // multer errors
        if (err instanceof multer.MulterError) {
                if (err.code === "LIMIT_FILE_SIZE") {
                        return res.status(StatusCodes.BAD_REQUEST).json(fail("File size cannot exceeds 3 MB"));
                }
        }

        // fallback
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json(fail("Oops! something went wrong"));
};
