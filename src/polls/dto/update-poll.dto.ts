import { z } from "zod";

export const UpdatePollDtoSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  buildingPermission: z.string().optional(),
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]),
  options: z
    .array(
      z.object({
        title: z.string().min(1, "선택지를 입력해주세요"),
      })
    )
    .min(2, "최소 2개의 선택지가 필요합니다")
    .optional(),
});

export type UpdatePollDto = z.infer<typeof UpdatePollDtoSchema>;

export const validateUpdatePoll = (data: unknown) =>
  UpdatePollDtoSchema.parse(data);
