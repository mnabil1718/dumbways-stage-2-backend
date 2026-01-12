import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateProductSchema, UpdateProductSchema } from "../models/product-model";
import { deleteProductsById, getProducts, getProductsById, postProducts, putProducts } from "../controllers/products-controller";
import { authenticate, authorizeAdmin } from "../middlewares/authenticate";

const router = Router();
router.post("/", validate(CreateProductSchema), postProducts);
router.put("/:id", validate(UpdateProductSchema), authenticate, authorizeAdmin, putProducts);
router.get("/", getProducts);
router.get("/:id", getProductsById);
router.delete("/:id", deleteProductsById);
export default router;
