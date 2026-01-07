import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { StatusCodes } from "http-status-codes";
import { formatZodErrorsAsObject } from "../utils/validation";
import { fail } from "@repo/shared";

export function validate<T extends z.ZodTypeAny>(schema: T) {
        return (req: Request, res: Response, next: NextFunction) => {
                const result = schema.safeParse(req.body);
                if (!result.success) {
                        const msgs: Record<string, string> = formatZodErrorsAsObject(result.error);
                        return res.status(StatusCodes.BAD_REQUEST).json(fail("request validation failed", msgs));
                } else {
                        next();
                }
        }
}

export function validateQuery<T extends z.ZodTypeAny>(schema: T) {
        return (req: Request, res: Response, next: NextFunction) => {
                const result = schema.safeParse(req.query);
                if (!result.success) {
                        const msgs: Record<string, string> = formatZodErrorsAsObject(result.error);
                        return res.status(StatusCodes.BAD_REQUEST).json(fail("query string validation failed", msgs));
                } else {
                        req.filter = result.data as any;
                        next();
                }
        }
}
