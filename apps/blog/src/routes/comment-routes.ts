import { Router } from "express";
import { validate } from "../middlewares/validate";
import { CreateCommentSchema, UpdateCommentSchema } from "../models/comment-model";
import { deleteCommentsById, postComments, putComments } from "../controllers/comments-controller";

const router = Router();
router.post("/", validate(CreateCommentSchema), postComments);
router.put("/:id", validate(UpdateCommentSchema), putComments);
router.delete("/:id", deleteCommentsById);
export default router;
