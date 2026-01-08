import z from "zod";
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



export type CommentWithRelations = Prisma.CommentGetPayload<{
        include: {
                user: true,
        };
}>;

export const includes = {
        user: true,
} satisfies Prisma.CommentInclude;


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
