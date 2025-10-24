import { z } from 'zod';
import { NoticeCategoryEnum } from "./notice-request.dto"

export const UpdateResponseSchema = z.object({
    noticeId: z.string().uuid().default(""),
    userId: z.string().uuid().optional(),
    category: NoticeCategoryEnum,
    title: z.string().trim().min(1, "제목은 1자 이상이어야 합니다."),
    writerName: z.string().default("noname"),
    isPinned: z.boolean(),
    boardId: z.string().uuid().optional(),
    createdAt: z.date().nullable(),
    updatedAt: z.date().nullable(),
    viewsCount: z.number().int().min(0).optional(),
    commentsCount: z.number().int().min(0).optional(),
    startDate: z.date().nullable(),
    endDate: z.date().nullable(),
});

export type UpdateResponseDto = z.infer<typeof UpdateResponseSchema>;