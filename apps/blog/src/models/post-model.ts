import { NotFoundError } from "@repo/shared";
import { prisma } from "../lib/prisma";
import z from "zod";
import { Prisma } from "../generated/prisma/client";
import { Category } from "./category-model";
import { PostWhereInput } from "../generated/prisma/models";

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
export type PostWithRelations = Prisma.PostGetPayload<{
        include: {
                author: true,
                categories: {
                        include: {
                                category: true,
                        }
                },
        };
}>;

export const includes = {
        author: true,
        categories: {
                include: {
                        category: true,
                },
        },
        _count: {
                select: { comments: true }
        }
} satisfies Prisma.PostInclude;

/***
 * CreatePostSchema represent user supplied request
 * 
 *
 * The rest of the fields are calculated/set server-side
 * therefore why we need to use CreatePost DTO to transfer
 * data from controller to model function.
 */
export const CreatePostSchema = z.object({
        title: z.string().min(1).max(100),
        category_ids: z.array(z.number().gte(1)).optional(),
        content: z.string(),
        published: z.boolean(),
});

// DTO from controller to model, different from
// CreatePostSchema that user supplied on request
export type CreatePost = z.infer<typeof CreatePostSchema> & { authorId: number; slug: string; };


export const UpdatePostSchema = CreatePostSchema.partial();

export type UpdatePost = z.infer<typeof UpdatePostSchema> & { id: number; };

export interface PostResponse {
        id: number;
        slug: string;
        title: string;
        content: string;
        published: boolean;
        categories: Category[];
        author: {
                name: string;
        }
}

export type PostWithCommentCountResponse = PostResponse & { comment_count: number; };

// ===== FILTERS ======

/***
* parse query string 
* categories=1,2,3,4 into [1,2,3,4]
*/
function parseCSVToArray(s: unknown): unknown {
        if (typeof s === "string") {
                return s
                        .split(",")
                        .map(Number);
        }

        // probably fail
        return s;
}

export const PostFilterSchema = z.object({
        categories: z.preprocess((val) => {
                return parseCSVToArray(val);
        },
                z.array(z.number().gte(1)).max(5),
        ).optional(),
        min_comments: z.coerce.number().nonnegative().optional(),
});

export type PostFilter = z.infer<typeof PostFilterSchema>;

// ==== QUERY BUILDERS ====

export function buildCategoriesQuery(arr?: number[]): undefined | Prisma.CategoriesOnPostsCreateNestedManyWithoutPostInput {
        let res: Prisma.CategoriesOnPostsCreateWithoutPostInput[] = [];

        if (!arr || arr.length === 0) return undefined;

        for (const id of arr) {
                res.push({
                        category: {
                                connect: {
                                        id,
                                },
                        },
                });
        };

        return { create: res };
}


// ===== MAPPERS =====

export function mapPostToResponse(origin: PostWithRelations): PostResponse {
        return {
                id: origin.id,
                slug: origin.slug,
                title: origin.title,
                content: origin.content,
                published: origin.published,
                categories: origin.categories.map(c => c.category),
                author: {
                        name: origin.author.name,
                }
        };
}


export function mapPoststoResponses(arr: PostWithRelations[]): PostResponse[] {
        return arr.map((p) => {
                return mapPostToResponse(p);
        });
}

// ===== QUERIES =====

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
        const post: PostWithRelations = await prisma.post.create({
                data: {
                        title: data.title,
                        slug: data.slug,
                        content: data.content,
                        published: data.published,
                        authorId: data.authorId,
                        categories: buildCategoriesQuery(data.category_ids),
                },
                include: includes,
        });

        return mapPostToResponse(post);
}

export async function updatePostById(data: UpdatePost): Promise<PostResponse> {
        const post: PostWithRelations = await prisma.post.update({
                where: {
                        id: data.id,
                },
                data: {
                        title: data.title,
                        content: data.content,
                        published: data.published,
                        categories: {
                                deleteMany: {}, // delete existing first
                                ...buildCategoriesQuery(data.category_ids),
                        },
                },
                include: includes,
        });
        return mapPostToResponse(post);
}

export async function getAllPosts(filter: PostFilter): Promise<PostWithCommentCountResponse[]> {
        const min = filter.min_comments ?? 0;
        const filterArray = filter.categories ?? [];


        const posts: PostWithCommentCountResponse[] =
                await prisma.$queryRaw`
				SELECT
				    p.id,
				    p.slug,
				    p.title,
				    p.content,
				    p.published,
				    json_build_object(
					'name', u.name
				    ) AS author,
				    COALESCE(
					json_agg(json_build_object('id', c.id, 'nama', c.name))
					FILTER (WHERE c.id IS NOT NULL), '[]'
				    ) AS categories,
				    COUNT(DISTINCT cm.id)::int AS comment_count
				FROM "Post" p
				JOIN "User" u ON u.id = p."authorId"
				LEFT JOIN "CategoriesOnPosts" cp ON cp."postId" = p.id
				LEFT JOIN "Category" c ON c.id = cp."categoryId"
				LEFT JOIN "Comment" cm ON cm."postId" = p.id
				GROUP BY p.id, u.id, u.name
				HAVING 
				COUNT(DISTINCT cm.id)::int >= ${min}
				AND (
					cardinality(${filterArray}::int[]) = 0 OR 
					array_agg(c.id) && ${filterArray}::int[]
				)
				`;

        return posts;
};

export async function getPostById(id: number): Promise<PostResponse> {
        const post = await prisma.post.findUnique({
                where: {
                        id,
                },
                include: includes,
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
                include: includes,
        });

        if (!post) throw new NotFoundError("Post not found");
        return mapPostToResponse(post);
};

export async function deletePostById(id: number): Promise<PostResponse> {
        const post = await prisma.post.delete({
                where: {
                        id,
                },
                include: includes,
        });

        return mapPostToResponse(post);
}
