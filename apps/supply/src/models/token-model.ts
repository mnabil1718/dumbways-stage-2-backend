import { NotFoundError } from "@repo/shared";
import { TOKEN_SCOPE } from "../generated/prisma/enums";
import { prisma } from "../lib/prisma";

export interface Token {
        id: number;
        userId: number;
        token: string; // hashed
        scope: TOKEN_SCOPE;
        expiresAt: Date;
}

export type CreateToken = Omit<Token, "id">

export async function insertToken(data: CreateToken): Promise<Token> {
        return await prisma.token.create({
                data: {
                        userId: data.userId,
                        token: data.token,
                        scope: data.scope,
                        expiresAt: data.expiresAt,
                },
        });
}

export async function getToken(hashedToken: string, scope: TOKEN_SCOPE): Promise<Token> {
        const t = await prisma.token.findFirst({
                where: {
                        token: hashedToken,
                        scope,
                        expiresAt: {
                                gt: new Date(),
                        },
                },
        });

        if (!t) throw new NotFoundError("token not found");

        return t;
}
