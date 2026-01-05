import { calcLastId } from "@repo/shared";
import z from "zod";
import { getProductById, Product } from "./product-model";

export enum ORDER_STATUS {
        PENDING = "pending",
        PROCESSING = "processing",
        COMPLETED = "completed",
        CANCELLED = "cancelled"
}

export enum PAYMENT_METHOD {
        CASH = "cash",
        CREDIT_CARD = "credit_card",
        PAYPAL = "paypal",
}

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


export interface OrderItem {
        id: number;
        order_id: number;     // references order
        product_id: number;   // references Product
        product_name: string; // copy product data incase of deletion
        price: number;        // copy product data incase of deletion
        subtotal: number;     // price * qty
        qty: number;
}

export interface Order {
        id: number;
        total_amount: number;           // total price all items
        shipping_address_id: number;    // references shipping address
        payment_method: PAYMENT_METHOD;
        status: ORDER_STATUS;
        created_at: Date;
        updated_at: Date;
}

export const CreateOrderItemSchema = z.object({
        product_id: z.number().gte(1),
        qty: z.number().gte(1),
});

export const CreateShippingAddressSchema = z.object({
        recipient_name: z.string().min(1),
        street: z.string().min(1),
        city: z.string().min(1),
        province: z.string().min(1),
        postal_code: z.string().min(1),
        country: z.string().min(1),
        phone: z.string().regex(/_phone$/),
});

export const CreateOrderSchema = z.object({
        items: z.array(CreateOrderItemSchema).min(1),
        shipping_address: CreateShippingAddressSchema,
        payment_method: z.enum(PAYMENT_METHOD),
});

export type CreateOrderItem = z.infer<typeof CreateOrderItemSchema>;
export type CreateShippingAddress = z.infer<typeof CreateShippingAddressSchema>;
export type CreateOrder = z.infer<typeof CreateOrderSchema>;

export type ShippingAddressResponse = z.infer<typeof CreateShippingAddressSchema>;
export type OrderItemResponse = {
        product_id: number;
        product_name: string;
        qty: number;
        price: number;
        subtotal: number;
};
export type OrderResponse = {
        id: number;
        items: OrderItemResponse[],
        shipping_address: ShippingAddressResponse,
        payment_method: PAYMENT_METHOD,
        status: ORDER_STATUS,
        total_amount: number;
        created_at: Date;
        updated_at: Date;
};


export const orders: Order[] = [];
export const order_items: OrderItem[] = [];
export const shipping_addresses: ShippingAddress[] = [];


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

export function insertOrder(data: CreateOrder): OrderResponse | undefined {
        const orderId = calcLastId(orders);
        const items: OrderItemResponse[] = []; // this order's order items
        let total_amount = 0;

        for (const itm of data.items) {

                const p = getProductById(itm.product_id);
                if (!p) {
                        return; // invalid product
                }

                const orditm = insertOrderItems(orderId, p, itm);
                total_amount += orditm.subtotal;
                items.push({ ...orditm }); // for order final response
        }


        const addr: ShippingAddress = insertShippingAddress(data.shipping_address);
        const now = new Date();
        const newStatus = ORDER_STATUS.PENDING;

        const order: Order = {
                id: orderId,
                total_amount,
                shipping_address_id: addr.id,
                payment_method: data.payment_method,
                status: newStatus,
                created_at: now,
                updated_at: now,
        };

        orders.push(order);

        const ship_addr_res: ShippingAddressResponse = { ...addr };

        return {
                id: orderId,
                payment_method: data.payment_method,
                status: newStatus,
                total_amount,
                created_at: now,
                updated_at: now,
                shipping_address: ship_addr_res,
                items,
        };
}


export function getOrderItemsByOrderId(orderId: number): OrderItemResponse[] {
        return order_items.filter(item => item.order_id === orderId);
}

export function getShippingAddressById(id: number): ShippingAddressResponse | undefined {
        return shipping_addresses.find((addr) => addr.id === id);
}


export function getOrders(): OrderResponse {
        const ords: OrderResponse[] = [];

        for (const o of orders) {
                const o_items: OrderItemResponse[] = getOrderItemsByOrderId(o.id);
                const o_addr: ShippingAddressResponse = getShippingAddressById(o.shipping_address_id);

                if (!o_addr) {
                        continue;
                }

                ords.push({
                        ...o,
                        shipping_address: o_addr,
                        items: o_items,
                })
        }
}
