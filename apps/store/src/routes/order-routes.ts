import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateOrderSchema, UpdateOrderSchema } from "../models/order-model";
import { deleteOrdersById, getOrders, getOrdersById, postOrders, putOrdersById } from "../controllers/orders-controller";

const router = Router();
router.post("/", validate(CreateOrderSchema), postOrders);
router.get("/", getOrders);
router.get("/:id", getOrdersById);
router.put("/:id", validate(UpdateOrderSchema), putOrdersById);
router.delete("/:id", deleteOrdersById);
export default router;
