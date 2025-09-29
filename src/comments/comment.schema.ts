import { z } from "zod";

export enum BoardType {
  COMPLAINT = "COMPLAINT",
  NOTICE = "NOTICE",
}

export const createCommentSchema = z.object({
  content: z.string().min(1, "댓글 내용은 필수입니다."),
  boardType: z.enum([BoardType.COMPLAINT, BoardType.NOTICE]), // 배열 대신 enum 값 사용
  boardId: z.string().uuid({ message: "boardId는 UUID 형식이어야 합니다." }),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, "댓글 내용은 필수입니다."),
});
