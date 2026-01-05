import { Router } from "express";
import productRoutes from "./product-routes";

const router = Router();

// TODO: mount resource routes
router.use("/products", productRoutes);

export default router;
