import { z } from "zod";
import { calcLastId } from "@repo/shared";
import { Product } from "./product-model";

export interface OrderItem {
        id: number;
        order_id: number;     // references order
        product_id: number;   // references Product
        product_name: string; // copy product data incase of deletion
        price: number;        // copy product data incase of deletion
        subtotal: number;     // price * qty
        qty: number;
}

export const CreateOrderItemSchema = z.object({
        product_id: z.number().gte(1),
        qty: z.number().gte(1),
});

export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;

export type OrderItemResponse = {
        product_id: number;
        product_name: string;
        qty: number;
        price: number;
        subtotal: number;
};

// update schemas

export const UpdateOrderItemSchema = CreateOrderItemSchema.optional();

export type UpdateOrderItem = z.infer<typeof UpdateOrderItemSchema>;

// in-mem store

export const order_items: OrderItem[] = [];

export function insertOrderItems(orderId: number, p: Product, data: CreateOrderItem): OrderItem {
        const orderItemId = calcLastId(order_items);
        const subtotal = data.qty * p.price;
        const orditm: OrderItem = {
                id: orderItemId,
                order_id: orderId,
                product_id: data.product_id,
                product_name: p.name,
                price: p.price,
                qty: data.qty,
                subtotal,
        };

        order_items.push(orditm);
        return orditm;
}

export function getOrderItemsByOrderId(orderId: number): OrderItemResponse[] {
        return order_items.filter(item => item.order_id === orderId);
}
