import { Router } from "express";
import { deletePostsById, getPostsById, getPostsComments, getPostsCommentSummary, postPosts, putPosts } from "../controllers/posts-controller";
import { getPosts } from "../controllers/posts-controller";
import { validate, validateQuery } from "../middlewares/validate";
import { CreatePostSchema, PostFilterSchema, UpdatePostSchema } from "../models/post-model";
import { PaginationFilterSchema } from "@repo/shared";
import { CommentFilterSchema } from "../models/comment-model";

const router = Router();
router.post("/", validate(CreatePostSchema), postPosts);
router.put("/:id", validate(UpdatePostSchema), putPosts);
router.get("/", validateQuery(PostFilterSchema), getPosts);
router.get("/comments-summary", validateQuery(CommentFilterSchema), validateQuery(PaginationFilterSchema), getPostsCommentSummary);
router.get("/:id", getPostsById);
router.delete("/:id", deletePostsById);
router.get("/:id/comments", validateQuery(PaginationFilterSchema), getPostsComments);
export default router;
