import { z } from "zod";
import { calcLastId } from "@repo/shared";
import { Product } from "./product-model";

export interface OrderItem {
        id: number;
        order_id: number;      // references order
        product_id: number;    // references Product
        product_name: string;  // copy product data incase of deletion
        product_price: number; // copy product data incase of deletion
        subtotal: number;      // price * qty
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
        product_price: number;
        subtotal: number;
        qty: number;
};

// update schemas

export const UpdateOrderItemSchema = CreateOrderItemSchema.optional();

export type UpdateOrderItem = z.infer<typeof UpdateOrderItemSchema>;

// in-mem store

export const order_items: OrderItem[] = [];


export function mapOrderItemToResponse(origin: OrderItem): OrderItemResponse {
        return {
                product_id: origin.product_id,
                product_name: origin.product_name,
                qty: origin.qty,
                product_price: Math.round(100 * origin.product_price) / 100,
                subtotal: Math.round(100 * origin.subtotal) / 100,
        }
}

export function mapOrderItemsToResponses(arr: OrderItem[]): OrderItemResponse[] {
        return arr.map(item => mapOrderItemToResponse(item));
}

export function insertOrderItems(orderId: number, p: Product, data: CreateOrderItem): OrderItem {
        const orderItemId = calcLastId(order_items);
        const subtotal = data.qty * p.price;
        const orditm: OrderItem = {
                id: orderItemId,
                order_id: orderId,
                product_id: data.product_id,
                product_name: p.name,
                product_price: p.price,
                qty: data.qty,
                subtotal,
        };

        order_items.push(orditm);
        return orditm;
}

export function getOrderItemsByOrderId(orderId: number): OrderItemResponse[] {
        return order_items.filter(item => item.order_id === orderId).map((item) => mapOrderItemToResponse(item));
}

