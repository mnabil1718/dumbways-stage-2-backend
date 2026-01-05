import { Router } from "express";
import { deletePostsById, getPostsById, postPosts } from "../controllers/post-controller";
import { getPosts } from "../controllers/post-controller";

const router = Router();
router.post("/", postPosts);
router.get("/", getPosts);
router.get("/:id", getPostsById);
router.delete("/:id", deletePostsById);
export default router;
