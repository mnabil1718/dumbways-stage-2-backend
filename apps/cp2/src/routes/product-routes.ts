import { Router } from "express";
import { deleteProductsById, getProducts, getProductsById, postProducts, updateProductsById } from "../controllers/product-controller";
import { validate } from "../middlewares/validate";
import { CreateProductSchema, UpdateProductSchema } from "../models/product-model";

const router = Router();
router.post("/", validate(CreateProductSchema), postProducts);
router.get("/", getProducts);
router.get("/:id", getProductsById);
router.put("/:id", validate(UpdateProductSchema), updateProductsById);
router.delete("/:id", deleteProductsById);
export default router;
