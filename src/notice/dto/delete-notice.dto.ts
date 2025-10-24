import { z } from 'zod';

// 공지사항 삭제 요청 DTO
export const DeleteNoticeRequestDto = z.object({
    noticeId: z.string(),
});

// 공지사항 삭제 응답 DTO
export const DeleteNoticeResponseDto = z.object({
    message: z.string().default("공지사항이 정상적으로 삭제 되었습니다."),
});

export type DeleteNoticeRequestDtoType = z.infer<typeof DeleteNoticeRequestDto>;
