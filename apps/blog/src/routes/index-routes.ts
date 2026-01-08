import { Router } from "express";
import postRoutes from "./post-routes";
import userRoutes from "./user-routes";
import categoryRoutes from "./category-routes";
import commentRoutes from "./comment-routes";

const router = Router();

// TODO: mount resource routes
router.use("/posts", postRoutes);
router.use("/users", userRoutes);
router.use("/categories", categoryRoutes);
router.use("/comments", commentRoutes);

export default router;
