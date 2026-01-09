import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateUserSchema, UpdateUserSchema } from "../models/user-model";
import { deleteUsersById, getUsers, getUsersById, postUsers, putUsers } from "../controllers/users-controller";

const router = Router();
router.post("/", validate(CreateUserSchema), postUsers);
router.put("/:id", validate(UpdateUserSchema), putUsers);
router.get("/", getUsers);
router.get("/:id", getUsersById);
router.delete("/:id", deleteUsersById);
export default router;
