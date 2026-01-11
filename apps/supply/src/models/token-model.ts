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
