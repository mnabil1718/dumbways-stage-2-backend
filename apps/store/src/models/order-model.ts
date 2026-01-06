import z from "zod";
import { calcLastId, InvariantError, NotFoundError } from "@repo/shared";
import { getProductById } from "./product-model";
import { CreateOrderItemSchema, getOrderItemsByOrderId, insertOrderItems, mapOrderItemToResponse, order_items, OrderItemResponse, UpdateOrderItemSchema } from "./order-item-model";
import { CreateShippingAddressSchema, getShippingAddressById, insertShippingAddress, mapShippingAddressToResponse, ShippingAddress, ShippingAddressResponse, UpdateShippingAddressSchema } from "./shipping-address-model";

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

export interface Order {
        id: number;
        total_amount: number;           // total price all items
        shipping_address_id: number;    // references shipping address
        payment_method: PAYMENT_METHOD;
        status: ORDER_STATUS;
        created_at: Date;
        updated_at: Date;
}

export const CreateOrderSchema = z.object({
        items: z.array(CreateOrderItemSchema).min(1),
        shipping_address: CreateShippingAddressSchema,
        payment_method: z.enum(PAYMENT_METHOD),
});

export type CreateOrder = z.infer<typeof CreateOrderSchema>;

// update

export const UpdateOrderSchema = z.object({
        payment_method: z.enum(PAYMENT_METHOD).optional(),
        items: z.array(UpdateOrderItemSchema).optional(),
        shipping_address: UpdateShippingAddressSchema,
});

export type UpdateOrder = z.infer<typeof UpdateOrderSchema>;

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

export function mapOrderToResponse(origin: Order, items: OrderItemResponse[], addr: ShippingAddressResponse): OrderResponse {
        return {
                id: origin.id,
                payment_method: origin.payment_method,
                status: origin.status,
                total_amount: Math.round(origin.total_amount * 100) / 100,
                created_at: origin.created_at,
                updated_at: origin.updated_at,
                shipping_address: addr,
                items,
        };
}

export function insertOrder(data: CreateOrder): OrderResponse {
        const orderId = calcLastId(orders);
        const items: OrderItemResponse[] = []; // this order's order items
        let total_amount = 0;

        for (const itm of data.items) {
                const p = getProductById(itm.product_id);
                if (itm.qty > p.stock) {
                        throw new InvariantError("invalid product quantity");
                }

                const orditm = insertOrderItems(orderId, p, itm);
                total_amount += orditm.subtotal;
                items.push(mapOrderItemToResponse(orditm)); // for order final response
        }


        const addr: ShippingAddress = insertShippingAddress(data.shipping_address);
        const newStatus = ORDER_STATUS.PENDING;
        const now = new Date();

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

        const ship_addr_res: ShippingAddressResponse = mapShippingAddressToResponse(addr);

        return mapOrderToResponse(order, items, ship_addr_res);
}

export function updateOrderById(orderId: number, data: UpdateOrder): OrderResponse {
        const idx = orders.findIndex(o => o.id === orderId);
        if (idx === -1) throw new NotFoundError("Order not found");
        const o: Order = orders[idx];

        if (data.items && o.status != ORDER_STATUS.PENDING) throw new Error("Cannot update items on processed orders");

        let total_amount = o.total_amount;
        let items: OrderItemResponse[] = getOrderItemsByOrderId(orderId);
        if (data.items) {
                // remove old items
                const filtered = order_items.filter(itm => itm.order_id !== orderId);
                order_items.length = 0;
                order_items.push(...filtered);

                items = [];
                total_amount = 0;

                for (const itm of data.items) {
                        const item = itm!;
                        const p = getProductById(item.product_id);
                        const orditm = insertOrderItems(orderId, p, item);
                        total_amount += orditm.subtotal;
                        items.push(mapOrderItemToResponse(orditm));
                }
        }

        let o_addr: ShippingAddressResponse = getShippingAddressById(o.shipping_address_id);
        if (data.shipping_address) {
                const new_addr = insertShippingAddress(data.shipping_address);
                o.shipping_address_id = new_addr.id;
                o_addr = mapShippingAddressToResponse(new_addr);
        }

        if (data.payment_method) {
                o.payment_method = data.payment_method;
        }

        o.total_amount = total_amount;
        o.updated_at = new Date();

        orders[idx] = o;
        return mapOrderToResponse(o, items, o_addr);
}

export function getAllOrders(): OrderResponse[] {
        const ords: OrderResponse[] = [];

        for (const o of orders) {
                const o_items: OrderItemResponse[] = getOrderItemsByOrderId(o.id);
                const o_addr: ShippingAddressResponse = getShippingAddressById(o.shipping_address_id);
                ords.push(mapOrderToResponse(o, o_items, o_addr));
        }

        return ords;
}

export function getOrderById(id: number): OrderResponse {
        const o = orders.find(o => o.id === id);

        if (!o) throw new NotFoundError("Order not found");

        const o_items: OrderItemResponse[] = getOrderItemsByOrderId(o.id);
        const o_addr: ShippingAddressResponse = getShippingAddressById(o.shipping_address_id);

        return mapOrderToResponse(o, o_items, o_addr);
}


export function deleteOrderById(id: number): OrderResponse {
        const idx: number = orders.findIndex(o => o.id === id);
        if (idx === -1) throw new NotFoundError("Order not found");
        const o: Order = orders.splice(idx, 1)[0];

        const o_items: OrderItemResponse[] = getOrderItemsByOrderId(o.id);
        const o_addr: ShippingAddressResponse = getShippingAddressById(o.shipping_address_id);

        return mapOrderToResponse(o, o_items, o_addr);
}
