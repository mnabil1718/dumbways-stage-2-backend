import { Request, Response } from "express";
import { InvariantError, ok } from "@repo/shared";
import { deleteUserById, getAllUsers, getUserById, getUserByIdAsUser, insertUser, UpdateUser, updateUserById, User } from "../models/user-model";
import { StatusCodes } from "http-status-codes";
import { CreateTransaction, insertTransaction } from "../models/transaction-model";

export const postTransaction = async (req: Request, res: Response) => {

        const { amount, toId } = req.body;

        const fromId = 1; // dummy, from JWT later

        if (fromId === toId) {
                throw new InvariantError("Cannot transfer points to yourself");
        }

        await getUserById(toId);

        const create: CreateTransaction = {
                amount,
                toId,
                fromId,
        };

        const u = await insertTransaction(create);
        res.status(StatusCodes.CREATED).json(ok("Transfer point successful", u));
}
