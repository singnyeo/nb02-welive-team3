import { z } from "zod";

export const PollOptionUpdateSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, "선택지를 입력해주세요"),
});

export type PollOptionUpdateDto = z.infer<typeof PollOptionUpdateSchema>;
