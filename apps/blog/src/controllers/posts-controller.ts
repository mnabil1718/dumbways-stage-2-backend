import { Request, Response } from "express";
import { ok, slugify } from "@repo/shared";
import { CreatePost, getPostById, insertPost, getAllPosts, getPostBySlug, deletePostById, updatePostById, PostResponse, UpdatePost, checkPostIDExists } from "../models/post-model";
import { StatusCodes } from "http-status-codes";

export const postPosts = async (req: Request, res: Response) => {

        const { title, content, published } = req.body;

        const slug: string = slugify(title);
        const authorId = 1;  // dummy, later will be retrieved from auth info or token
        const createPost: CreatePost = {
                title,
                content,
                slug,
                authorId,
                published,
        };

        const post = await insertPost(createPost);
        res.status(StatusCodes.CREATED).json(ok("Post created successfully", post));
}

export const putPosts = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { title, content, published } = req.body;

        const p: PostResponse = await getPostById(Number(id));
        const update: UpdatePost = {
                id: p.id,
                title: title ?? p.title,
                content: content ?? p.content,
                published: published ?? p.published,
        };

        const post = await updatePostById(update);
        res.status(StatusCodes.OK).json(ok("Post updated successfully", post));
}

export const getPosts = async (req: Request, res: Response) => {
        const posts = await getAllPosts();
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
