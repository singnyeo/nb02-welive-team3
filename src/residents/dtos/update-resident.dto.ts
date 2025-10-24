import { z } from 'zod';
import { HouseholdType } from '../../entities/resident.entity';

export const updatedResidentSchema = z.object({
  building: z.string().min(1, '동은 필수 입력 항목입니다.').max(6, '동은 최대 6자까지 입력 가능합니다.'),
  unitNumber: z.string().min(1, '호수는 필수 입력 항목입니다.').max(6, '호수는 최대 6자까지 입력 가능합니다.'),
  contact: z.string()
    .min(10, '연락처는 필수 입력 항목입니다.')
    .max(20, '연락처는 최대 20자까지 입력 가능합니다.')
    .regex(/^01[016789]\d{7,8}$/, '연락처 형식이 올바르지 않습니다.'),
  name: z.string().min(2, '이름은 필수 입력 항목입니다.').max(20, '이름은 최대 20자까지 입력 가능합니다.'),
  isHouseholder: z.enum(HouseholdType),
}).partial();

export type UpdatedResidentDto = z.infer<typeof updatedResidentSchema>;
