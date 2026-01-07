import { Request, Response } from "express";
import { CreateOrder, deleteOrderById, getAllOrders, getOrderById, getOrderByIdAsOrder, insertOrder, Order, OrderResponse, updateOrderById } from "../models/order-model";
import { StatusCodes } from "http-status-codes";
import { ok } from "@repo/shared";
import { ProductFilter } from "../models/product-model";


export const postOrders = async (req: Request, res: Response) => {
        const order: OrderResponse = await insertOrder(req.body);
        const create: CreateOrder = {
                ...req.body,
                user_id: 1, // dummy
        };
        res.status(StatusCodes.CREATED).json(ok("Order placed successfully", create));
}

export const putOrdersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const o: Order = await getOrderByIdAsOrder(Number(id));
        const order: OrderResponse = await updateOrderById(Number(id), req.body, o);

        res.status(StatusCodes.OK).json(ok("Order updated successfully", order));
}

export const getOrders = async (req: Request, res: Response) => {
        const fl: ProductFilter = {

        }
        const orders: OrderResponse[] = await getAllOrders();
        res.status(StatusCodes.OK).json(ok("Orders fetched successfully", orders));
}

export const getOrdersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = await getOrderById(Number(id));
        res.status(StatusCodes.OK).json(ok("Order fetched successfully", order));
}

export const deleteOrdersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        await getOrderByIdAsOrder(Number(id));

        const order: OrderResponse = await deleteOrderById(Number(id));
        res.status(StatusCodes.OK).json(ok("Order deleted successfully", order));
}


