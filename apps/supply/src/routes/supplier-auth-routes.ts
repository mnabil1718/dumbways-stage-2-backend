import { Router } from "express";
import { validate } from "../middlewares/validate";
import { deleteUsersById, getUsers, getUsersById, postUsers, putUsers } from "../controllers/users-controller";
import { loginUsers, postResetUsersPassword, putUsersPassword, registerUsers } from "../controllers/auth-user-controller";
import { CreateSupplierSchema } from "../models/supplier-model";

const router = Router();
router.post("/register", validate(CreateSupplierSchema), registerUsers);
router.post("/login", validate(LoginSchema), loginUsers);
router.post("/forgot-password", validate(CreateUserPasswordResetSchema), postResetUsersPassword);
router.put("/reset-password", validate(UpdateUserPasswordSchema), putUsersPassword);
export default router;
