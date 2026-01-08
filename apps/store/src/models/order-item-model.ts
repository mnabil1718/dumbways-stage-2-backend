import { z } from "zod";
import { prisma } from "../lib/prisma";

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

export type CreateOrderItem = Omit<OrderItem, "id" | "order_id">;

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

export async function insertOrderItems(orderId: number, temp_items: CreateOrderItem[]): Promise<OrderItem[]> {

        return await prisma.orderItem.createManyAndReturn({
                data: temp_items.map((temp) => ({
                        qty: temp.qty,
                        order_id: orderId,
                        product_id: temp.product_id,
                        product_name: temp.product_name,
                        product_price: temp.product_price,
                        subtotal: temp.subtotal,
                })),
        });

}

export async function getOrderItemsByOrderId(orderId: number): Promise<OrderItemResponse[]> {
        const items = await prisma.orderItem.findMany({
                where: {
                        order_id: orderId,
                },
        });

        return mapOrderItemsToResponses(items);
}



export async function getOrderItemsByOrderIdAsOrderItem(orderId: number): Promise<OrderItem[]> {
        return await prisma.orderItem.findMany({
                where: {
                        order_id: orderId,
                },
        });
}

export async function deleteOrderItemsByOrderId(orderId: number): Promise<void> {
        await prisma.orderItem.deleteMany({
                where: {
                        order_id: orderId,
                },
        });
} 

