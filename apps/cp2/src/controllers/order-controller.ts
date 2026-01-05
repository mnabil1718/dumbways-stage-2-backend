import { Request, Response } from "express";
import { deleteOrderById, getAllOrders, getOrderById, insertOrder, OrderResponse, updateOrderById } from "../models/order-model";
import { StatusCodes } from "http-status-codes";


export const postOrders = (req: Request, res: Response) => {
        const order: OrderResponse = insertOrder(req.body);
        res.status(StatusCodes.CREATED).json({ order });
}

export const putOrdersById = (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = updateOrderById(Number(id), req.body);
        res.status(StatusCodes.OK).json(order);
}

export const getOrders = (req: Request, res: Response) => {
        const orders: OrderResponse[] = getAllOrders();
        res.status(StatusCodes.OK).json(orders);
}

export const getOrdersById = (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = getOrderById(Number(id));
        res.status(StatusCodes.OK).json(order);
}

export const deleteOrdersById = (req: Request, res: Response) => {
        const { id } = req.params;
        const order: OrderResponse = deleteOrderById(Number(id));
        res.status(StatusCodes.OK).json(order);
}


