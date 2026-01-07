import z from "zod";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "@repo/shared";

export interface User {
        id: number;
        email: string;
        password: string;
        name: string;
}

export type UserResponse = Omit<User, "password">;

export const CreateUserSchema = z.object({
        name: z.string().min(1).max(60),
        email: z.email(),
        password: z.string().min(6).max(20),
});

export type CreateUser = z.infer<typeof CreateUserSchema>;

// update

export const UpdateUserSchema = CreateUserSchema.partial();

export type UpdateUser = User;

export function mapUserToResponse(origin: User): UserResponse {
        return {
                id: origin.id,
                name: origin.name,
                email: origin.email,
        };
}

export function mapUsersToResponses(arr: User[]): UserResponse[] {
        return arr.map((usr) => ({
                id: usr.id,
                name: usr.name,
                email: usr.email,
        }));
}

export async function insertUser(data: CreateUser): Promise<UserResponse> {
        const u = await prisma.user.create({
                data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                },
        });

        return mapUserToResponse(u);
}


export async function updateUserById(data: UpdateUser): Promise<UserResponse> {
        const u = await prisma.user.update({
                where: {
                        id: data.id,
                },
                data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                },
        });

        return mapUserToResponse(u);
}

export async function getAllUsers(): Promise<UserResponse[]> {
        const users = await prisma.user.findMany();
        return mapUsersToResponses(users);
}


export async function checkUserIDExists(id: number): Promise<void> {
        const u = await prisma.user.findUnique({
                where: {
                        id,
                },
        });

        if (!u) throw new NotFoundError("User not found");
}

export async function getUserById(id: number): Promise<UserResponse> {
        const u = await prisma.user.findUnique({
                where: {
                        id,
                },
        });

        if (!u) throw new NotFoundError("User not found");
        return mapUserToResponse(u);
}

export async function getUserByEmail(email: string): Promise<UserResponse> {
        const u = await prisma.user.findUnique({
                where: {
                        email,
                },
        });

        if (!u) throw new NotFoundError("User not found");
        return mapUserToResponse(u);
}


export async function getUserByIdAsUser(id: number): Promise<User> {
        const u = await prisma.user.findUnique({
                where: {
                        id,
                },
        });

        if (!u) throw new NotFoundError("User not found");
        return u;
}

export async function deleteUserById(id: number): Promise<UserResponse> {
        const u = await prisma.user.delete({
                where: {
                        id,
                },
        });

        return mapUserToResponse(u);
}


