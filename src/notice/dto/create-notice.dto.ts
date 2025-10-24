import { z } from 'zod';
import { CreateNoticeRequestSchema } from '../dto/notice-request.dto'

export const CreateNoticeDto = CreateNoticeRequestSchema
  .refine((data) => {
    if (data.startDate && data.endDate) {
      return new Date(data.endDate) <= new Date(data.endDate);
    }
    return true;
  }, {
    message: "startDate는 endDate보다 이전 또는 같아야 합니다.",
    path: ["startDate"],
  });


export type CreateNoticeRequestDto = z.infer<typeof CreateNoticeRequestSchema>;

/** 성공 응답 스키마(메시지형) */
export const CreateNoticeResponseSchema = z.object({
  message: z.literal("정상적으로 등록 처리되었습니다."),
});
export type CreateNoticeResponseDto = z.infer<typeof CreateNoticeResponseSchema>;

export { CreateNoticeDto as CreateNoticeRequestSchema };
