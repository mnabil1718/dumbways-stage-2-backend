import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateSupplierSchema, UpdateSupplierSchema } from "../models/supplier-model";
import { deleteSuppliersById, getSuppliers, getSuppliersById, postSuppliers, putSuppliers } from "../controllers/suppliers-controller";

const router = Router();
router.post("/", validate(CreateSupplierSchema), postSuppliers);
router.put("/:id", validate(UpdateSupplierSchema), putSuppliers);
router.get("/", getSuppliers);
router.get("/:id", getSuppliersById);
router.delete("/:id", deleteSuppliersById);
export default router;
