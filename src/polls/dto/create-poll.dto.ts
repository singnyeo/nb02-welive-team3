import { z } from "zod";

export const CreatePollDtoSchema = z.object({
  boardId: z.string(),
  status: z.enum(["IN_PROGRESS", "PENDING", "COMPLETED"]),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  buildingPermission: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  options: z
    .array(
      z.object({
        title: z.string().min(1, "선택지를 입력해주세요"),
      })
    )
    .min(2, "최소 2개의 선택지가 필요합니다"),
});

export type CreatePollDto = z.infer<typeof CreatePollDtoSchema>;

export const validateCreatePoll = (data: unknown) =>
  CreatePollDtoSchema.parse(data);
