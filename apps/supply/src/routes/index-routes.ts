import { Router } from "express";
import userRoutes from "./user-routes";
import transactionRoutes from "./tx-routes";
import productRoutes from "./product-routes";
import supplierRoutes from "./supplier-routes";

const router = Router();

router.use("/users", userRoutes);
router.use("/transactions", transactionRoutes);
router.use("/products", productRoutes);
router.use("/suppliers", supplierRoutes);
export default router;
