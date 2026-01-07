import { Router } from "express";
import productRoutes from "./product-routes";
import orderRoutes from "./order-routes";
import userRoutes from "./user-routes";

const router = Router();

// TODO: mount resource routes
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);
router.use("/users", userRoutes);

export default router;
