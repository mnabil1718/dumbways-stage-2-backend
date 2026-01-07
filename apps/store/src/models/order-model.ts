import z from "zod";
import { InvariantError, NotFoundError } from "@repo/shared";
import { getProductsByIds, Product } from "./product-model";
import { CreateOrderItem, CreateOrderItemSchema, deleteOrderItemsByOrderId, getOrderItemsByOrderId, getOrderItemsByOrderIdAsOrderItem, insertOrderItems, mapOrderItemsToResponses, mapOrderItemToResponse, order_items, OrderItem, OrderItemResponse, UpdateOrderItemSchema } from "./order-item-model";
import { CreateShippingAddressSchema, deleteShippingAddressById, getShippingAddressById, getShippingAddressByIdNonResponse, insertShippingAddress, insertShippingAddressAsResponse, mapShippingAddressToResponse, ShippingAddress, ShippingAddressResponse, UpdateShippingAddressSchema } from "./shipping-address-model";
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
        const temp_items: CreateOrderItem[] = [];
        let total_amount = 0;

        /***
         * Insert address from request
         * Returns `ShippingAddress`
         */
        const addr: ShippingAddress = await insertShippingAddress(data.shipping_address);

        /***
         * Fetch products, out of stock checks, calculate temp items
         */
        // get products once
        const product_ids: number[] = data.items.map((i) => i.product_id);
        const products = await getProductsByIds(product_ids);
        const p_map: Map<number, Product> = new Map(products.map(p => [p.id, p]));

        for (const itm of data.items) {
                const p = p_map.get(itm.product_id);
                if (!p) throw new InvariantError("one of the order item is not found");


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
                        shipping_address_id: addr.id,
                        total_amount,
                }
        });

        /***
         * Bulk insert order items 
         */
        const order_items: OrderItem[] = await insertOrderItems(new_o.id, temp_items);

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


        const items_res: OrderItemResponse[] = mapOrderItemsToResponses(order_items);
        const addr_res: ShippingAddressResponse = mapShippingAddressToResponse(addr);
        return mapOrderToResponse(new_o, items_res, addr_res);
}

export async function updateOrderById(orderId: number, update: UpdateOrder, curr: Order): Promise<OrderResponse> {
        if (curr.status != ORDER_STATUS.PENDING) throw new Error("Cannot update items on processed orders");

        /***
         * Replace related shipping address if changed. Fetch old data otherwise.
         */
        let addr: ShippingAddress;
        if (update.shipping_address) {
                // insert new one
                addr = await insertShippingAddress(update.shipping_address);
        } else {
                // get existing
                addr = await getShippingAddressByIdNonResponse(curr.shipping_address_id);
        }

        /***
         * Update order items if supplied
         */
        let total_amount = curr.total_amount;
        let items: OrderItem[] = await getOrderItemsByOrderIdAsOrderItem(orderId);
        if (update.items) {
                // remove old items
                await deleteOrderItemsByOrderId(orderId);

                // get products once
                const product_ids: number[] = update.items.map((i) => i!.product_id);
                const products = await getProductsByIds(product_ids);
                const p_map: Map<number, Product> = new Map(products.map(p => [p.id, p]));

                total_amount = 0;
                const temp_items: CreateOrderItem[] = [];

                for (const item of update.items) {
                        const p = p_map.get(item!.product_id);
                        if (!p) throw new InvariantError("one of the order item is not found");
                        const sub = p.price * item!.qty;

                        temp_items.push({
                                product_id: item!.product_id,
                                product_name: p.name,
                                product_price: p.price,
                                subtotal: sub,
                                qty: item!.qty,
                        });

                        total_amount += sub;
                }

                items = await insertOrderItems(orderId, temp_items);
        }

        /***
         * Update order
         */
        const order: Order = await prisma.order.update({
                where: {
                        id: orderId,
                },
                data: {
                        payment_method: update.payment_method ?? curr.payment_method,
                        shipping_address_id: addr.id,
                        updated_at: new Date(),
                        total_amount,
                }
        });

        if (update.shipping_address) {
                // delete old if changed
                await deleteShippingAddressById(curr.shipping_address_id);
        }

        return mapOrderToResponse(order, mapOrderItemsToResponses(items), mapShippingAddressToResponse(addr));
}

export async function getAllOrders(): Promise<OrderResponse[]> {
        const res: OrderResponse[] = [];

        const orders = await prisma.order.findMany({
                include: {
                        items: true,
                        shipping_address: true,
                },
        });

        for (const o of orders) {
                const o_itm = mapOrderItemsToResponses(o.items);
                const o_addr = mapShippingAddressToResponse(o.shipping_address);
                const mapped = mapOrderToResponse(o, o_itm, o_addr);
                res.push(mapped);
        }

        return res;
}

export async function getOrderById(id: number): Promise<OrderResponse> {
        const o = await prisma.order.findUnique({
                where: {
                        id,
                },
                include: {
                        items: true,
                        shipping_address: true,
                },
        });

        if (!o) throw new NotFoundError("Order not found");

        const o_items: OrderItemResponse[] = mapOrderItemsToResponses(o.items);
        const o_addr: ShippingAddressResponse = mapShippingAddressToResponse(o.shipping_address);

        return mapOrderToResponse(o, o_items, o_addr);
}

export async function getOrderByIdAsOrder(id: number): Promise<Order> {
        const o = await prisma.order.findUnique({
                where: {
                        id,
                },
        });

        if (!o) throw new NotFoundError("Order not found");
        return o;
}


export async function deleteOrderById(id: number): Promise<OrderResponse> {
        const order = await prisma.order.delete({
                where: {
                        id,
                },
                include: {
                        items: true,
                        shipping_address: true,
                },
        });

        const o_items: OrderItemResponse[] = mapOrderItemsToResponses(order.items);
        const o_addr: ShippingAddressResponse = mapShippingAddressToResponse(order.shipping_address);
        return mapOrderToResponse(order, o_items, o_addr);
}
