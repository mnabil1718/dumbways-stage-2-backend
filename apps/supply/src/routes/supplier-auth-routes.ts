import { Router } from "express";
import { validate } from "../middlewares/validate";
import { registerUsers } from "../controllers/auth-user-controller";
import { CreateSupplierSchema } from "../models/supplier-model";
import { LoginSchema } from "../models/auth-model";
import { loginSessionSuppliers, loginSuppliers } from "../controllers/auth-suppliers-controller";

const router = Router();
router.post("/register", validate(CreateSupplierSchema), registerUsers);
router.post("/login", validate(LoginSchema), loginSuppliers);
router.post("/login/session", validate(LoginSchema), loginSessionSuppliers);
export default router;
