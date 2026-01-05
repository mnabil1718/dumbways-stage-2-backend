import { Request, Response } from "express";
import { slugify } from "../utils/slugify";
import { CreatePost, getPostById, insertPost, getPosts as getAllPosts, getPostBySlug, deletePostById } from "../models/post-model";
import { StatusCodes } from "http-status-codes";

export const postPosts = (req: Request, res: Response) => {

        const { title, content } = req.body;

        const slug: string = slugify(title);
        const createPost: CreatePost = {
                title,
                content,
                slug,
        };

        const post = insertPost(createPost);
        res.status(StatusCodes.CREATED).json(post);
}

export const getPosts = (req: Request, res: Response) => {
        const posts = getAllPosts();
        res.status(StatusCodes.OK).json(posts);
}

export const getPostsById = (req: Request, res: Response) => {
        const { id } = req.params;
        const post = getPostById(Number(id));

        if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
        }

        res.status(StatusCodes.OK).json(post);
}


export const getPostsBySlug = (req: Request, res: Response) => {
        const { slug } = req.params;
        const post = getPostBySlug(slug);

        if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
        }

        res.status(StatusCodes.OK).json(post);
}

export const deletePostsById = (req: Request, res: Response) => {
        const { id } = req.params;
        const post = deletePostById(Number(id));
        if (!post) {
                return res.status(StatusCodes.NOT_FOUND).json({ message: "Post not found" });
        }

        res.status(StatusCodes.OK).json(post);
}
