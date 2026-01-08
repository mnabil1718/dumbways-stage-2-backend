import { Router } from "express";
import { deleteProductsById, getProducts, getProductsById, postProducts, updateProductsById } from "../controllers/products-controller";
import { validate, validateQuery } from "../middlewares/validate";
import { CreateProductSchema, ProductFilterSchema, UpdateProductSchema } from "../models/product-model";
import { PaginationFilterSchema } from "@repo/shared";

const router = Router();
router.post("/", validate(CreateProductSchema), postProducts);
router.get("/", validateQuery(ProductFilterSchema), validateQuery(PaginationFilterSchema), getProducts);
router.get("/:id", getProductsById);
router.put("/:id", validate(UpdateProductSchema), updateProductsById);
router.delete("/:id", deleteProductsById);
export default router;
