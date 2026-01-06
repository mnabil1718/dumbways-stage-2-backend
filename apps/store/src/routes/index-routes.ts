import { Router } from "express";
import productRoutes from "./product-routes";
import orderRoutes from "./order-routes";

const router = Router();

// TODO: mount resource routes
router.use("/products", productRoutes);
router.use("/orders", orderRoutes);

export default router;
