import { ok } from "@repo/shared";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { Comment, CreateComment, deleteCommentById, getCommentById, insertComment, updateComment, UpdateComment } from "../models/comment-model";

export const postComments = async (req: Request, res: Response) => {
        const { postId, content } = req.body;
        const create: CreateComment = {
                userId: 2, // dummy
                postId,
                content
        };
        const c = await insertComment(create);
        res.status(StatusCodes.CREATED).json(ok("Comment created successfully", c));
}

export const putComments = async (req: Request, res: Response) => {
        const { id } = req.params;
        const { content } = req.body;
        const cId: number = Number(id);

        const c: Comment = await getCommentById(cId);

        const data: UpdateComment = {
                id: cId,
                content,
        };

        const updated = await updateComment(data);
        res.status(StatusCodes.OK).json(ok("Comment updated successfully", updated));
}

export const deleteCommentsById = async (req: Request, res: Response) => {
        const { id } = req.params;

        await getCommentById(Number(id));

        const c = await deleteCommentById(Number(id));
        res.status(StatusCodes.OK).json(ok("Comment deleted successfully", c));
}
