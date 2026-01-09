import z, { gte } from "zod";
import { prisma } from "../lib/prisma";
import { Prisma } from "../generated/prisma/client";
import { buildPaginationQuery, calculatePaginationMetadata, NotFoundError, PaginationFilter, PaginationMetadata } from "@repo/shared";

export interface Comment {
        id: number;
        userId: number;
        postId: number;
        content: string;
        created_at: Date;
        updated_at: Date;
}

export interface CommentResponse {
        user_name: string;
        content: string;
        created_at: Date;
}

export interface PaginatedComment {
        comments: CommentResponse[];
        metadata: PaginationMetadata;
}

export interface PaginatedCommentSummary {
        summaries: CommentSummary[];
        metadata: PaginationMetadata;
}



export type CommentWithRelations = Prisma.CommentGetPayload<{
        include: {
                user: true,
        };
}>;

export const includes = {
        user: true,
} satisfies Prisma.CommentInclude;

type RawCommentSummary = {
        id: number;
        title: string;
        user_name: string;
        comment_count: number;
        total_items: number;
};

export interface CommentSummary {
        post_id: number;
        post_title: string;
        author_name: string;
        comment_count: number;
}


// CREATE

export const CreateCommentSchema = z.object({
        postId: z.number().gte(1),
        content: z.string().min(1).max(500),
});

export type CreateComment = z.infer<typeof CreateCommentSchema> & { userId: number; };

// UPDATE

export const UpdateCommentSchema = z.object({
        content: z.string().min(1).max(500),
});

export type UpdateComment = z.infer<typeof UpdateCommentSchema> & {
        id: number;
};

// FILTERS


export const CommentFilterSchema = z.object({
        max_comments: z.coerce.number().nonnegative().optional(),
        min_comments: z.coerce.number().nonnegative().optional(),
}).superRefine((data, ctx) => {
        if (data.min_comments !== undefined && data.max_comments !== undefined && data.min_comments > data.max_comments) {
                ctx.addIssue({
                        path: ["max_comments"],
                        message: "min_comments cannot be greater than max_comments",
                        code: "custom",
                });
        }
});


export type CommentFilter = z.infer<typeof CommentFilterSchema>;


// QUERY BUILDERS


// can't have empty having, therefore return undefined if no filters provided
function buildHaving(filter: CommentFilter): undefined | Prisma.CommentScalarWhereWithAggregatesInput {

        if (filter.min_comments === undefined && filter.max_comments === undefined) return;

        const having: Prisma.CommentScalarWhereWithAggregatesInput = {};

        having.postId = {
                ...(filter.min_comments !== undefined ? { gte: filter.min_comments } : undefined),
                ...(filter.max_comments !== undefined ? { lte: filter.max_comments } : undefined),
        };

        return having;
}




// MAPPERS


export function mapCommentToResponse(origin: CommentWithRelations): CommentResponse {
        return {
                user_name: origin.user.name,
                content: origin.content,
                created_at: origin.created_at,
        };
}

export function mapCommentsToResponses(arr: CommentWithRelations[]): CommentResponse[] {
        return arr.map((c) => mapCommentToResponse(c));
}

export function mapSummaryToResponse(raw: RawCommentSummary): CommentSummary {
        return {
                post_id: raw.id,
                post_title: raw.title,
                author_name: raw.user_name,
                comment_count: raw.comment_count,
        };
}

export function mapSummariesToResponses(arr: RawCommentSummary[]): { summaries: CommentSummary[]; total_items: number; } {
        if (arr.length < 1) return { summaries: [], total_items: 0 };

        const total_items = arr[0].total_items;
        const summaries = arr.map(s => mapSummaryToResponse(s));

        return {
                total_items,
                summaries,
        }
}


// QUERIES

export async function insertComment(data: CreateComment): Promise<CommentResponse> {
        const c = await prisma.comment.create({
                data: {
                        userId: data.userId,
                        postId: data.postId,
                        content: data.content,
                },
                include: includes,
        });

        return mapCommentToResponse(c);
}


export async function updateComment(data: UpdateComment): Promise<CommentResponse> {
        const c = await prisma.comment.update({
                where: {
                        id: data.id,
                },
                data: {
                        content: data.content,
                        updated_at: new Date(),
                },
                include: includes,
        });

        return mapCommentToResponse(c);
}

export async function deleteCommentById(id: number): Promise<CommentResponse> {
        const c = await prisma.comment.delete({
                where: {
                        id,
                },
                include: includes,
        });

        return mapCommentToResponse(c);
}

export async function getCommentById(id: number): Promise<Comment> {
        const c = await prisma.comment.findUnique({
                where: {
                        id,
                },
        });

        if (!c) throw new NotFoundError("Comment not found");
        return c;
}


export async function getCommentsByPostId(postId: number, pFilter: PaginationFilter): Promise<PaginatedComment> {
        const pagination = buildPaginationQuery(pFilter);

        const [comments, total_items] = await Promise.all([
                prisma.comment.findMany({
                        where: {
                                postId,
                        },
                        include: includes,
                        ...pagination,
                }),
                prisma.comment.count({
                        where: {
                                postId,
                        },
                }),
        ]);

        return {
                comments: mapCommentsToResponses(comments),
                metadata: calculatePaginationMetadata(pFilter, total_items),
        } as PaginatedComment;
}



export async function getCommentsGroupByPost(pFilter: PaginationFilter, filter: CommentFilter): Promise<PaginatedCommentSummary> {
        const { skip, take } = buildPaginationQuery(pFilter);

        const conditions: Prisma.Sql[] = [];

        if (filter.min_comments !== undefined) {
                conditions.push(Prisma.sql`COUNT(c."postId") >= ${filter.min_comments}`);
        }
        if (filter.max_comments !== undefined) {
                conditions.push(Prisma.sql`COUNT(c."postId") <= ${filter.max_comments}`);
        }

        // Build dynamic HAVING clause
        const having = conditions.length > 0 ? Prisma.sql`HAVING ${Prisma.join(conditions, ' AND ')}` : Prisma.sql``;

        const res = await prisma.$queryRaw<
                RawCommentSummary[]
        >`
	  SELECT
	      p.id,
	      p.title,
	      u.name AS user_name,
	      COUNT(c."postId")::int AS comment_count,
	      COUNT(*) OVER ()::int AS total_items
	  FROM "Comment" c
	  JOIN "Post" p ON c."postId" = p.id
	  JOIN "User" u ON p."authorId" = u.id
	  GROUP BY c."postId", p.id, u.id
	  ${having}
	  LIMIT ${take} OFFSET ${skip};
	`;

        const { summaries, total_items } = mapSummariesToResponses(res);

        return {
                metadata: calculatePaginationMetadata(pFilter, total_items),
                summaries,
        }
}
