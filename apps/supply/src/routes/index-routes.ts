import { Router } from "express";
import userRoutes from "./user-routes";

const router = Router();

// TODO: mount resource routes
router.use("/users", userRoutes);

export default router;
