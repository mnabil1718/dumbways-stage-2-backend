import z from "zod";
import { prisma } from "../lib/prisma";
import { InvariantError } from "@repo/shared";

export interface Transaction {
        id: number;
        fromId: number;
        toId: number;
        amount: number;
        createdAt: Date;
}

export const CreateTransactionSchema = z.object({
        amount: z.number().int().gt(0),
        toId: z.number().int().gt(0),
});

export type CreateTransaction = z.infer<typeof CreateTransactionSchema> & { fromId: number; }


export type TransactionResponse = Omit<Transaction, "id" | "fromId">;

export function mapTransactionToResponse(origin: Transaction): TransactionResponse {
        return {
                amount: origin.amount,
                toId: origin.toId,
                createdAt: origin.createdAt,
        };
}


export async function insertTransaction(data: CreateTransaction): Promise<TransactionResponse> {

        return prisma.$transaction(async (tx) => {
                const sender = await tx.user.update({
                        where: {
                                id: data.fromId,
                        },
                        data: {
                                balance: {
                                        decrement: data.amount,
                                },
                        },
                });


                if (sender.balance < 0) throw new InvariantError("Insufficient points to transfer. A.K.A you are broke.");

                await tx.user.update({
                        where: {
                                id: data.toId,
                        },
                        data: {
                                balance: {
                                        increment: data.amount,
                                },
                        },
                });


                const tr = await tx.transaction.create({
                        data: {
                                fromId: data.fromId,
                                toId: data.toId,
                                amount: data.amount,
                        },
                });

                return mapTransactionToResponse(tr);

        });
}
