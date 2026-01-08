import { Request, Response } from "express";
import { deleteOrderById, getAllOrders, getOrderById, getOrderByIdAsOrder, groupOrderSummaryByUserId, insertOrder, Order, OrderResponse, PaginatedOrderSummary, updateOrderById } from "../models/order-model";
import { StatusCodes } from "http-status-codes";
import { ok, PaginationFilter, PaginationFilterSchema } from "@repo/shared";


export const postOrders = async (req: Request, res: Response) => {
        const order: OrderResponse = await insertOrder(req.body);
        res.status(StatusCodes.CREATED).json(ok("Order placed successfully", order));
}

export const putOrdersById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const o: Order = await getOrderByIdAsOrder(Number(id));
        const order: OrderResponse = await updateOrderById(Number(id), req.body, o);

        res.status(StatusCodes.OK).json(ok("Order updated successfully", order));
}

export const getOrders = async (req: Request, res: Response) => {
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

export const getOrderSummaries = async (req: Request, res: Response) => {
        const pFilter: PaginationFilter = PaginationFilterSchema.parse(req.query);
        const result: PaginatedOrderSummary = await groupOrderSummaryByUserId(pFilter);
        res.status(StatusCodes.OK).json(ok("Order summaries fetched successfully", result));
}

