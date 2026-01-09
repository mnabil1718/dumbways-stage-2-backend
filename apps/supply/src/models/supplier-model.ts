import z from "zod";
import { prisma } from "../lib/prisma";
import { NotFoundError } from "@repo/shared";

export interface Supplier {
        id: number;
        name: string;
        email: string;
        password: string;
}

export const CreateSupplierSchema = z.object({
        name: z.string().min(1),
        email: z.email(),
        password: z.string().min(4).max(12),
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
