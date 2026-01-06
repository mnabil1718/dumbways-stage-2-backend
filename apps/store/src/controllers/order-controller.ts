import { Request, Response } from "express";
import { deleteOrderById, getAllOrders, getOrderById, insertOrder, OrderResponse, updateOrderById } from "../models/order-model";
import { StatusCodes } from "http-status-codes";
import { ok } from "@repo/shared";


export const postOrders = async (req: Request, res: Response) => {
        const order: OrderResponse = await insertOrder(req.body);
        res.status(StatusCodes.CREATED).json(ok("Order placed successfully", order));
}

export const putOrdersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = await updateOrderById(Number(id), req.body);
        res.status(StatusCodes.OK).json(ok("Order updated successfully", order));
}

export const getOrders = (req: Request, res: Response) => {
        const orders: OrderResponse[] = getAllOrders();
        res.status(StatusCodes.OK).json(ok("Orders fetched successfully", orders));
}

export const getOrdersById = (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = getOrderById(Number(id));
        res.status(StatusCodes.OK).json(ok("Order fetched successfully", order));
}

export const deleteOrdersById = (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = deleteOrderById(Number(id));
        res.status(StatusCodes.OK).json(ok("Order deleted successfully", order));
}


