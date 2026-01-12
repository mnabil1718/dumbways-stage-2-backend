import z from "zod";
import { prisma } from "../lib/prisma";
import { AuthenticationError, NotFoundError } from "@repo/shared";
import { ROLE } from "../generated/prisma/enums"

export interface User {
        id: number;
        email: string;
        password: string;
        name: string;
        balance: number;
        role: ROLE;
}

export type UserResponse = Omit<User, "password" | "balance">;

export const CreateUserSchema = z.object({
        email: z.email(),
        name: z.string().min(1).max(60),
        password: z.string().min(6).max(20),
        balance: z.number().nonnegative().optional(),
        role: z.enum(ROLE),
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
                role: origin.role,
        };
}

export function mapUsersToResponses(arr: User[]): UserResponse[] {
        return arr.map((usr) => mapUserToResponse(usr));
}

export async function insertUser(data: CreateUser): Promise<UserResponse> {
        const u = await prisma.user.create({
                data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        balance: data.balance,
                        role: data.role,
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
                        balance: data.balance,
                        role: data.role,
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

export async function getUserByEmail(email: string): Promise<User> {
        const u = await prisma.user.findUnique({
                where: {
                        email,
                },
        });

        if (!u) throw new AuthenticationError("invalid credentials");
        return u;
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

export async function updateUserPasswordById(id: number, hashedPassword: string): Promise<void> {
        await prisma.user.update({
                where: {
                        id,
                },
                data: {
                        password: hashedPassword
                },
        });
}
