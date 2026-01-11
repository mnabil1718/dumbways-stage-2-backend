import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateUserSchema, UpdateUserSchema } from "../models/user-model";
import { deleteUsersById, getUsers, getUsersById, postUsers, putUsers } from "../controllers/users-controller";
import { loginUsers, registerUsers } from "../controllers/auth-user-controller";
import { LoginSchema, RegisterUserSchema } from "../models/auth-model";

const router = Router();
router.post("/register", validate(RegisterUserSchema), registerUsers);
router.post("/login", validate(LoginSchema), loginUsers);
export default router;
