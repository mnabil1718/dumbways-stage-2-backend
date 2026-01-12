import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateProductSchema, UpdateProductSchema } from "../models/product-model";
import { deleteProductsById, getProducts, getProductsById, postProducts, postProductsImage, putProducts } from "../controllers/products-controller";
import { authenticate, authorizeAdmin } from "../middlewares/authenticate";
import { singleImageUploadMiddleware } from "../middlewares/upload";

const router = Router();
router.post("/", validate(CreateProductSchema), postProducts);
router.post("/:id/upload-image", singleImageUploadMiddleware, postProductsImage);
router.put("/:id", validate(UpdateProductSchema), authenticate, authorizeAdmin, putProducts);
router.get("/", getProducts);
router.get("/:id", getProductsById);
router.delete("/:id", deleteProductsById);
export default router;
