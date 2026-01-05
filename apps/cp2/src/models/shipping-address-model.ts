import { calcLastId, NotFoundError } from "@repo/shared";
import { z } from "zod";

export interface ShippingAddress {
        id: number;
        recipient_name: string;
        street: string;
        city: string;
        province: string;
        postal_code: string;
        country: string;
        phone: string;
}

export const CreateShippingAddressSchema = z.object({
        recipient_name: z.string().min(1),
        street: z.string().min(1),
        city: z.string().min(1),
        province: z.string().min(1),
        postal_code: z.string().min(1),
        country: z.string().min(1),
        phone: z.string().regex(/_phone$/),
});

export type CreateShippingAddress = z.infer<typeof CreateShippingAddressSchema>;

export type ShippingAddressResponse = z.infer<typeof CreateShippingAddressSchema>;

// update schemas

export const UpdateShippingAddressSchema = CreateShippingAddressSchema.optional();

export type UpdateShippingAddress = z.infer<typeof UpdateShippingAddressSchema>;

// in-mem store

export const shipping_addresses: ShippingAddress[] = [];

export function insertShippingAddress(data: CreateShippingAddress): ShippingAddress {

        const addr: ShippingAddress = {
                id: calcLastId(shipping_addresses),
                recipient_name: data.recipient_name,
                city: data.city,
                country: data.country,
                phone: data.phone,
                postal_code: data.postal_code,
                province: data.province,
                street: data.street,
        };

        shipping_addresses.push(addr);
        return addr;
}

export function getShippingAddressById(id: number): ShippingAddressResponse {
        const addr = shipping_addresses.find((addr) => addr.id === id);
        if (!addr) throw new NotFoundError("Shipping address not found");
        return addr;
}
