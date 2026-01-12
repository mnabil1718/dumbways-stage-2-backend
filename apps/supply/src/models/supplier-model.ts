import z from "zod";
import { prisma } from "../lib/prisma";
import { InvariantError, NotFoundError } from "@repo/shared";
import { TransactionClient } from "../generated/prisma/internal/prismaNamespace";
import { ROLE } from "../generated/prisma/enums";

export interface Supplier {
        id: number;
        name: string;
        email: string;
        password: string;
        role: ROLE;
}

export const CreateSupplierSchema = z.object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(4).max(12),
        role: z.enum(ROLE),
});

export type CreateSupplier = z.infer<typeof CreateSupplierSchema>;

export const UpdateSupplierSchema = CreateSupplierSchema.partial();

export type UpdateSupplier = z.infer<typeof UpdateSupplierSchema> & { id: number; };

export type SupplierResponse = Omit<Supplier, "password">;

export function mapToResponse(origin: Supplier): SupplierResponse {
        return {
                id: origin.id,
                name: origin.name,
                email: origin.email,
                role: origin.role,
        };
}

export function mapToResponses(arr: Supplier[]): SupplierResponse[] {
        return arr.map(s => mapToResponse(s));
}

export async function insertSupplier(data: CreateSupplier): Promise<SupplierResponse> {
        const s = await prisma.supplier.create({
                data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        role: data.role,
                },
        });

        return mapToResponse(s);
}

export async function updateSupplier(data: UpdateSupplier): Promise<SupplierResponse> {
        const s = await prisma.supplier.update({
                where: {
                        id: data.id,
                },
                data: {
                        name: data.name,
                        email: data.email,
                        password: data.password,
                        role: data.role,
                },
        });

        return mapToResponse(s);
}

export async function getAllSuppliers(): Promise<SupplierResponse[]> {
        const s = await prisma.supplier.findMany();
        return mapToResponses(s);
};


export async function getSupplierById(id: number): Promise<Supplier> {
        const s = await prisma.supplier.findUnique({
                where: {
                        id,
                },
        });

        if (!s) throw new NotFoundError("Supplier not found");
        return s;
};


export async function getSupplierByEmail(email: string): Promise<Supplier> {
        const s = await prisma.supplier.findUnique({
                where: {
                        email,
                },
        });

        if (!s) throw new NotFoundError("invalid credentials");
        return s;
};

export async function deleteSupplierById(id: number): Promise<SupplierResponse> {
        const s = await prisma.supplier.delete({
                where: {
                        id,
                },
        });

        return mapToResponse(s);
}

export async function checkSupplierIDExists(id: number): Promise<void> {
        const p = await prisma.supplier.findUnique({
                where: {
                        id,
                },
        });

        if (!p) throw new NotFoundError("Supplier not found");
}

// needs to be inside transaction
export async function checkSupplierIDsExists(tx: TransactionClient, ids: number[]): Promise<void> {
        const suppliers = await tx.supplier.findMany({
                where: {
                        id: {
                                in: ids,
                        },
                },
        });

        const founds: Set<number> = new Set(suppliers.map((s) => s.id));
        const missings = ids.filter((id) => !founds.has(id));

        if (missings.length > 0) {
                throw new NotFoundError(`following supplier ids are not found: ${missings.join(', ')}`);
        }
}

