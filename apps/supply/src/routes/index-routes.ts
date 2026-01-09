import { Router } from "express";
import userRoutes from "./user-routes";
import transactionRoutes from "./tx-routes";

const router = Router();

// TODO: mount resource routes
router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
export default router;
