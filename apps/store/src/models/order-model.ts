import z from "zod";
import { calcLastId, InvariantError, NotFoundError } from "@repo/shared";
import { getProductById, Product } from "./product-model";
import { CreateOrderItemSchema, getOrderItemsByOrderId, insertOrderItems, mapOrderItemsToResponses, mapOrderItemToResponse, order_items, OrderItem, OrderItemResponse, UpdateOrderItemSchema } from "./order-item-model";
import { CreateShippingAddressSchema, getShippingAddressById, insertShippingAddress, mapShippingAddressToResponse, ShippingAddress, ShippingAddressResponse, UpdateShippingAddressSchema } from "./shipping-address-model";
import { ORDER_STATUS, PAYMENT_METHOD, PRODUCT_STATUS } from "../../generated/prisma/enums";
import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma/client";


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

export async function insertOrder(data: CreateOrder): Promise<OrderResponse> {
        const temp_items: Omit<OrderItem, "id" | "order_id">[] = [];
        let total_amount = 0;

        /***
         * Insert new shipping address
         */
        const new_addr: ShippingAddress = await insertShippingAddress(data.shipping_address);

        /***
         * Fetch products, out of stock checks, calculate temp items
         */
        for (const itm of data.items) {
                const p: Product = await getProductById(itm.product_id);
                if (p.status !== PRODUCT_STATUS.ACTIVE) {
                        throw new InvariantError("inactive product");
                }

                if (itm.qty > p.stock) {
                        throw new InvariantError("insufficient product quantity");
                }

                const subtotal = itm.qty * p.price;
                total_amount += subtotal;

                const temp: Omit<OrderItem, "id" | "order_id"> = {
                        product_id: p.id,
                        product_name: p.name,
                        product_price: p.price,
                        qty: itm.qty,
                        subtotal,
                };

                temp_items.push(temp);
        }

        /***
         * Insert order
         */
        const new_o: Order = await prisma.order.create({
                data: {
                        payment_method: data.payment_method,
                        shipping_address_id: new_addr.id,
                        total_amount,
                }
        });

        /***
         * Bulk insert order items 
         */
        const order_items: OrderItem[] = await prisma.orderItem.createManyAndReturn({
                data: temp_items.map((temp) => ({
                        qty: temp.qty,
                        order_id: new_o.id,
                        product_id: temp.product_id,
                        product_name: temp.product_name,
                        product_price: temp.product_price,
                        subtotal: temp.subtotal,
                })),
        });

        /***
         * Update product stock based on order qty.
         *
         * Using raw SQL to bulk update, maintaining performance.
         * NOTE: prisma `$executeRaw` is not susceptible to injection attacks
         */

        const values = temp_items.map(
                (i) => Prisma.sql`(${i.product_id}::int, ${i.qty}::int)` // Cast here
        );
        await prisma.$executeRaw`WITH updates(id, qty) AS (VALUES ${Prisma.join(values)})
				 UPDATE "Product" p
				 SET stock = stock - u.qty
				 FROM updates u
				 WHERE p.id = u.id AND p.stock >= u.qty;
				 `;

        const addr_res: ShippingAddressResponse = mapShippingAddressToResponse(new_addr);
        const items_res: OrderItemResponse[] = mapOrderItemsToResponses(order_items);
        return mapOrderToResponse(new_o, items_res, addr_res);
}

export async function updateOrderById(orderId: number, data: UpdateOrder): Promise<OrderResponse> {
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
                        const p = await getProductById(item.product_id);
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
