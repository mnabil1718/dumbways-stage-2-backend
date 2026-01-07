import { Router } from "express";
import { deleteProductsById, getProducts, getProductsById, postProducts, updateProductsById } from "../controllers/products-controller";
import { validate, validateQuery } from "../middlewares/validate";
import { CreateProductSchema, ProductFilterSchema, UpdateProductSchema } from "../models/product-model";

const router = Router();
router.post("/", validate(CreateProductSchema), postProducts);
router.get("/", validateQuery(ProductFilterSchema), getProducts);
router.get("/:id", getProductsById);
router.put("/:id", validate(UpdateProductSchema), updateProductsById);
router.delete("/:id", deleteProductsById);
export default router;
