import { z } from "zod";

export const createComplaintSchema = z.object({
  title: z.string().min(1, "제목은 필수입니다."),
  content: z.string().min(1, "내용은 필수입니다."),
  isPublic: z.boolean().default(true),
  boardId: z.string().uuid().nullable().optional(),
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]).default("PENDING"),
});

export const updateComplaintSchema = z.object({
  title: z.string().min(1).optional(),
  content: z.string().min(1).optional(),
  isPublic: z.boolean().optional(),
});

export const updateComplaintStatusSchema = z.object({
  status: z.enum(["PENDING", "IN_PROGRESS", "RESOLVED"]),
});
