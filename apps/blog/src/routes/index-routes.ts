import { Router } from "express";
import postRoutes from "./post-routes";
import userRoutes from "./user-routes";

const router = Router();

// TODO: mount resource routes
router.use("/posts", postRoutes);
router.use("/users", userRoutes);

export default router;
