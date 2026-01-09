import { Router } from "express";
import userRoutes from "./user-routes";
import transactionRoutes from "./tx-routes";
import productRoutes from "./product-routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/products", productRoutes);
export default router;
