import { Request, Response } from "express";
import { ok, PaginationFilter, PaginationFilterSchema, slugify } from "@repo/shared";
import { CreatePost, getPostById, insertPost, getAllPosts, getPostBySlug, deletePostById, updatePostById, PostResponse, UpdatePost, checkPostIDExists, PostFilter, PostFilterSchema } from "../models/post-model";
import { StatusCodes } from "http-status-codes";
import { CommentFilter, CommentFilterSchema, getCommentsByPostId, getCommentsGroupByPost, PaginatedCommentSummary } from "../models/comment-model";

export const postPosts = async (req: Request, res: Response) => {

        const { title, content, published, category_ids } = req.body;

        const slug: string = slugify(title);
        const authorId = 1;  // dummy, later will be retrieved from auth info or token
        const createPost: CreatePost = {
                title,
                content,
                slug,
                authorId,
                published,
                category_ids,
        };

        const post = await insertPost(createPost);
        res.status(StatusCodes.CREATED).json(ok("Post created successfully", post));
}

export const putPosts = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, content, published, category_ids } = req.body;

        const p: PostResponse = await getPostById(Number(id));
        const old_category_ids = p.categories.map(c => c.id);
        const update: UpdatePost = {
                id: p.id,
                title: title ?? p.title,
                content: content ?? p.content,
                published: published ?? p.published,
                category_ids: category_ids ?? old_category_ids,
        };

        const post = await updatePostById(update);
        res.status(StatusCodes.OK).json(ok("Post updated successfully", post));
}

export const getPosts = async (req: Request, res: Response) => {
        const filter: PostFilter = PostFilterSchema.parse(req.query);
        const posts = await getAllPosts(filter);
        res.status(StatusCodes.OK).json(ok("Posts fetched successfully", posts));
}

export const getPostsById = async (req: Request, res: Response) => {
        const { id } = req.params;
        const post = await getPostById(Number(id));

        res.status(StatusCodes.OK).json(ok("Post fetched successfully", post));
}

export const getPostsBySlug = async (req: Request, res: Response) => {
        const { slug } = req.params;
        const post = await getPostBySlug(slug);

        res.status(StatusCodes.OK).json(ok("Post fetched successfully", post));
}

export const deletePostsById = async (req: Request, res: Response) => {
        const { id } = req.params;

        await checkPostIDExists(Number(id));
        const post = await deletePostById(Number(id));
        res.status(StatusCodes.OK).json(ok("Post deleted successfully", post));
}


export const getPostsComments = async (req: Request, res: Response) => {
        const { id } = req.params;
        const postId: number = Number(id);
        const pFilter: PaginationFilter = PaginationFilterSchema.parse(req.query);

        await checkPostIDExists(postId);

        const comments = await getCommentsByPostId(postId, pFilter);
        res.status(StatusCodes.OK).json(ok("Comments fetched successfully", comments));
}


export const getPostsCommentSummary = async (req: Request, res: Response) => {
        const filter: CommentFilter = CommentFilterSchema.parse(req.query);
        const pFilter: PaginationFilter = PaginationFilterSchema.parse(req.query);

        const summaries: PaginatedCommentSummary = await getCommentsGroupByPost(pFilter, filter);
        res.status(StatusCodes.OK).json(ok("Comment summaries fetched successfully", summaries))
}
