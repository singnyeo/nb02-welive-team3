import { z } from "zod";

export const PollQueryParamsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(11),
});

export type PollQueryParams = z.infer<typeof PollQueryParamsSchema>;

export const validatePollQuery = (data: unknown) =>
  PollQueryParamsSchema.parse(data);
