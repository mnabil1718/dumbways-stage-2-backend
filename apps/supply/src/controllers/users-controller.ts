import { Request, Response } from "express";
import { hash, ok } from "@repo/shared";
import { checkUserIDExists, CreateUser, deleteUserById, getAllUsers, getUserById, getUserByIdAsUser, insertUser, UpdateUser, updateUserById, User } from "../models/user-model";
import { StatusCodes } from "http-status-codes";

export const postUsers = async (req: Request, res: Response) => {

        const { name, email, password, balance } = req.body;

        const hashed = await hash(password);

        const create: CreateUser = {
                name,
                email,
                password: hashed,
                balance: balance ?? 0,
        };

        const u = await insertUser(create);
        res.status(StatusCodes.CREATED).json(ok("User created successfully", u));
}

export const putUsers = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { name, email, password, balance } = req.body;

        const num_id = Number(id);

        const u: User = await getUserByIdAsUser(num_id);

        if (password) {
                u.password = await hash(password);
        }

        const update: UpdateUser = {
                id: u.id,
                name: name ?? u.name,
                email: email ?? u.email,
                password: u.password,
                balance: balance ?? u.balance,
        };

        const updatedUser = await updateUserById(update);
        res.status(StatusCodes.OK).json(ok("User updated successfully", updatedUser));
}

export const getUsers = async (req: Request, res: Response) => {
        const users = await getAllUsers();
        res.status(StatusCodes.OK).json(ok("Users fetched successfully", users));
}

export const getUsersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const u = await getUserById(Number(id));

        res.status(StatusCodes.OK).json(ok("User fetched successfully", u));
}

export const deleteUsersById = async (req: Request, res: Response) => {
        const { id } = req.params;

        await checkUserIDExists(Number(id));
        const user = await deleteUserById(Number(id));
        res.status(StatusCodes.OK).json(ok("User deleted successfully", user));
}
