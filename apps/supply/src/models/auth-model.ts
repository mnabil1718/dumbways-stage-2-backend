import z from "zod";
import { ROLE } from "../generated/prisma/enums";

export const passwordSchema = z.string().min(8).max(15).regex(/[a-z]/).regex(/[A-Z]/).regex(/[^a-zA-Z0-9]/);

export const LoginSchema = z.object({
        email: z.email(),
        password: z.string(),
});

export const RegisterUserSchema = z.object({
        email: z.email(),
        name: z.string().min(1).max(60),
        password: passwordSchema,
        balance: z.number().nonnegative().optional(),
        role: z.enum(ROLE)
});

export const CreateUserPasswordResetSchema = z.object({
        email: z.email(),
});

export const UpdateUserPasswordSchema = z.object({
        token: z.string().min(1),
        passoword: passwordSchema,
});
