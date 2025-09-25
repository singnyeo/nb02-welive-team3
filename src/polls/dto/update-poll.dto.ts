import { z } from "zod";
import { PollOptionUpdateSchema } from "./poll-option-update.dto";

const dateTimeSchema = z.string().refine((val) => !isNaN(Date.parse(val)), {
  message: "올바른 날짜 형식이 아닙니다 (ISO 8601)",
});

export const UpdatePollDtoSchema = z.object({
  userId: z.string(),
  title: z.string().min(1, "제목을 입력해주세요"),
  content: z.string().min(1, "내용을 입력해주세요"),
  buildingPermission: z.string().optional(),
  startDate: dateTimeSchema,
  endDate: dateTimeSchema,
  status: z.enum(["PENDING", "IN_PROGRESS", "CLOSED"]),
  options: z
    .array(PollOptionUpdateSchema)
    .min(2, "최소 2개의 선택지가 필요합니다")
    .optional(),
});

export type UpdatePollDto = z.infer<typeof UpdatePollDtoSchema>;

export const validateUpdatePoll = (data: unknown) =>
  UpdatePollDtoSchema.parse(data);
