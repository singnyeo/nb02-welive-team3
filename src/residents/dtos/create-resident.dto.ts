import { z } from 'zod';
import { HouseholdType, ResidentStatus } from '../../entities/resident.entity';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';

export const createResidentSchema = z.object({
  name: z.string().min(2, '이름은 필수 입력 항목입니다.').max(20, '이름은 최대 20자까지 입력 가능합니다.'),
  contact: z
    .string()
    .min(10, '연락처는 필수 입력 항목입니다.')
    .max(20, '연락처는 최대 20자까지 입력 가능합니다.')
    .regex(/^01[016789]\d{7,8}$/, '연락처 형식이 올바르지 않습니다.'),
  building: z.string().min(1, '동은 필수 입력 항목입니다.').max(6, '동은 최대 6자까지 입력 가능합니다.'),
  unitNumber: z.string().min(1, '호수는 필수 입력 항목입니다.').max(6, '호수는 최대 6자까지 입력 가능합니다.'),
  isHouseholder: z.enum(HouseholdType),
});

export type CreateResidentDto = z.infer<typeof createResidentSchema>;

export const ResidentResponseSchema = z.object({
  id: z.string(),
  userId: z.string().nullable(),
  building: z.string(),
  unitNumber: z.string(),
  contact: z.string(),
  name: z.string(),
  email: z.string().nullable(),
  residentStatus: z.enum(ResidentStatus),
  isHouseholder: z.enum(HouseholdType),
  isRegistered: z.boolean(),
  approvalStatus: z.union([z.enum(ApprovalStatus), z.literal('PENDING')]),
});

export type ResidentResponseDto = z.infer<typeof ResidentResponseSchema>;
