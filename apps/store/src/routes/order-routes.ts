import { Router } from "express";
import { validate, validateQuery } from "../middlewares/validate";
import { CreateOrderSchema, UpdateOrderSchema } from "../models/order-model";
import { deleteOrdersById, getOrders, getOrdersById, getOrderSummaries, postOrders, putOrdersById } from "../controllers/orders-controller";
import { PaginationFilterSchema } from "@repo/shared";

const router = Router();
router.get("/", getOrders);
router.post("/", validate(CreateOrderSchema), postOrders);
router.get("/summary", validateQuery(PaginationFilterSchema), getOrderSummaries);
router.get("/:id", getOrdersById);
router.put("/:id", validate(UpdateOrderSchema), putOrdersById);
router.delete("/:id", deleteOrdersById);
export default router;
