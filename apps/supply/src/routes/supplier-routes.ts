import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateSupplierSchema, UpdateSupplierSchema } from "../models/supplier-model";
import { batchUpdateSuppliersStock, deleteSuppliersById, getSuppliers, getSuppliersById, getSuppliersProducts, postSuppliers, putSuppliers } from "../controllers/suppliers-controller";
import { UpdateStockSchema } from "../models/stock-model";
import { authenticate } from "../middlewares/authenticate";

const router = Router();
router.post("/", validate(CreateSupplierSchema), postSuppliers);
router.put("/stock", validate(UpdateStockSchema), batchUpdateSuppliersStock);
router.get("/products", authenticate, getSuppliersProducts);
router.put("/:id", validate(UpdateSupplierSchema), putSuppliers);
router.get("/", getSuppliers);
router.get("/:id", getSuppliersById);
router.delete("/:id", deleteSuppliersById);
export default router;
