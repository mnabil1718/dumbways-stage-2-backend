import { NotFoundError } from "@repo/shared";
import { prisma } from "../lib/prisma";
import z from "zod";
import { Prisma } from "../generated/prisma/client";

export interface Post {
        id: number;
        slug: string;
        title: string;
        content: string;
        authorId: number;
        published: boolean;
}

/***
 * Type returned from Prisma queries. Intentionally includes
 * Author relation because the final Post Response will not
 * include `authorId`, but rather `author_name`.
 */
export type PostWithAuthor = Prisma.PostGetPayload<{
        include: {
                author: true,
        };
}>;

// DTO from controller to model, different from
// CreatePostSchema that user supplied on request
export type CreatePost = Omit<Post, "id">;

/***
 * CreatePostSchema represent user supplied request
 * and only 2 fields are supplied: title and content.
 *
 * The rest of the fields are calculated/set server-side
 * therefore why we need to use CreatePost DTO to transfer
 * data from controller to model function.
 */
export const CreatePostSchema = z.object({
        title: z.string().min(1).max(100),
        content: z.string(),
        published: z.boolean(),
});

export const UpdatePostSchema = CreatePostSchema.partial();

export interface UpdatePost {
        id: number;
        title: string;
        content: string;
        published: boolean;
};

export interface PostResponse {
        id: number;
        slug: string;
        title: string;
        content: string;
        published: boolean;
        author: {
                name: string;
        }
}

export function mapPostToResponse(origin: PostWithAuthor): PostResponse {
        return {
                id: origin.id,
                slug: origin.slug,
                title: origin.title,
                content: origin.content,
                published: origin.published,
                author: {
                        name: origin.author.name,
                }
        };
}

export function mapPoststoResponses(arr: PostWithAuthor[]): PostResponse[] {
        return arr.map((p) => {
                return mapPostToResponse(p);
        });
}


// useful for update and delete checks
export async function checkPostIDExists(id: number): Promise<void> {
        const post = await prisma.post.findUnique({
                where: {
                        id,
                },
        });

        if (!post) throw new NotFoundError("Post not found");
}

export async function insertPost(data: CreatePost): Promise<PostResponse> {
        const post: PostWithAuthor = await prisma.post.create({
                data: {
                        title: data.title,
                        slug: data.slug,
                        content: data.content,
                        published: data.published,
                        authorId: data.authorId,
                },
                include: {
                        author: true,
                },
        });
        return mapPostToResponse(post);
}

export async function updatePostById(data: UpdatePost): Promise<PostResponse> {
        const post: PostWithAuthor = await prisma.post.update({
                where: {
                        id: data.id,
                },
                data: {
                        title: data.title,
                        content: data.content,
                        published: data.published,
                },
                include: {
                        author: true,
                },
        });
        return mapPostToResponse(post);
}

export async function getAllPosts(): Promise<PostResponse[]> {
        const posts: PostWithAuthor[] = await prisma.post.findMany({
                include: {
                        author: true,
                },
        });
        return mapPoststoResponses(posts);
};

export async function getPostById(id: number): Promise<PostResponse> {
        const post = await prisma.post.findUnique({
                where: {
                        id,
                },
                include: {
                        author: true,
                },
        });

        // custom error instead of Prisma error
        if (!post) throw new NotFoundError("Post not found");
        return mapPostToResponse(post);
};

export async function getPostBySlug(slug: string): Promise<PostResponse> {
        const post = await prisma.post.findUnique({
                where: {
                        slug,
                },
                include: {
                        author: true,
                },
        });

        if (!post) throw new NotFoundError("Post not found");
        return mapPostToResponse(post);
};

export async function deletePostById(id: number): Promise<PostResponse> {
        const post = await prisma.post.delete({
                where: {
                        id,
                },
                include: {
                        author: true,
                },
        });

        return mapPostToResponse(post);
}
