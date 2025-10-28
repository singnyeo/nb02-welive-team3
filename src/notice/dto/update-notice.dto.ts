import { z } from 'zod';
import { UpdateRequestSchema } from '../dto/update-notice.request.dto'

export const UpdateNoticeDto = UpdateRequestSchema
    .partial()
    .extend({
        userId: z.string().uuid(),
        noticeId: z.string().uuid(),
        isPinned: z.boolean().optional(),
        boardId: z.string().optional()
    })
    .refine((d) => {
        if (d.startDate && d.endDate) {
            return new Date(d.startDate) <= new Date(d.endDate);
        }
        return true;
    }, {
        message: "startDate는 endsAt보다 이전 또는 같아야 합니다.",
        path: ["startDate"],
    })
    .refine((d) => Object.values(d).some((v) => v !== undefined), {
        message: "최소 1개 필드를 보내주세요.",
    });

export type UpdateNoticeRequestDto = z.infer<typeof UpdateNoticeDto>;


export { UpdateNoticeDto as UpdateNoticeRequestSchema };








