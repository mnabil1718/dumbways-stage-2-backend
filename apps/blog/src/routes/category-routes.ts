import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateCategorySchema, UpdateCategorySchema } from "../models/category-model";
import { deleteCategoriesById, getCategoriesById, postCategories, putCategories } from "../controllers/categories-controller";

const router = Router();
router.post("/", validate(CreateCategorySchema), postCategories);
router.put("/:id", validate(UpdateCategorySchema), putCategories);
router.get("/:id", getCategoriesById);
router.delete("/:id", deleteCategoriesById);
export default router;
