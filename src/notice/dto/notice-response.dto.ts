// 전체 조회 + 상세 조회 공통 dto 
import { z } from 'zod';
import { NoticeCategoryEnum } from "./notice-request.dto"

export const NoticeIdParamsSchema = z.object({
    id: z.string().uuid("유효한 공지 ID가 아닙니다."),
});
export type NoticeIdParamsDto = z.infer<typeof NoticeIdParamsSchema>;

export const NoticeListItemSchema = z.object({
    noticeId: z.string().uuid(),
    userId: z.string().uuid(),
    category: NoticeCategoryEnum,
    title: z.string().trim().min(1, "제목은 1자 이상이어야 합니다."),
    writerName: z.string(),
    isPinned: z.boolean(),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    boardId: z.string().uuid().optional(),

    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
    viewsCount: z.number().int().min(0),
    commentsCount: z.number().int().min(0),
});

export type NoticeListItemDto = z.infer<typeof NoticeListItemSchema>;

export const NoticeDetailSchema = NoticeListItemSchema.extend({
    content: z.string(),
});
export type NoticeDetailDto = z.infer<typeof NoticeDetailSchema>;

export const NoticeDetailResponseSchema = z.object({
    item: NoticeDetailSchema,
});
export type NoticeDetailResponseDto = z.infer<typeof NoticeDetailResponseSchema>;
