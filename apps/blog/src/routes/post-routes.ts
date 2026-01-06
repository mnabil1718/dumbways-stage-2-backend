import { Router } from "express";
import { deletePostsById, getPostsById, postPosts, putPosts } from "../controllers/post-controller";
import { getPosts } from "../controllers/post-controller";
import { validate } from "../middlewares/validate";
import { CreatePostSchema, UpdatePostSchema } from "../models/post-model";

const router = Router();
router.post("/", validate(CreatePostSchema), postPosts);
router.put("/:id", validate(UpdatePostSchema), putPosts);
router.get("/", getPosts);
router.get("/:id", getPostsById);
router.delete("/:id", deletePostsById);
export default router;
