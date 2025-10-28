import { z } from "zod";
import { BoardType } from "../entities/complaint-comment.entity";

export const createCommentSchema = z.object({
  content: z.string().min(1, "댓글 내용은 필수입니다."),
  boardType: z.enum(BoardType),
  boardId: z.string().uuid({ message: "boardId는 UUID 형식이어야 합니다." }),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "댓글 내용은 필수입니다."),
  boardType: z.enum(BoardType),
  boardId: z.string().uuid({ message: "boardId는 UUID 형식이어야 합니다." }),
});
