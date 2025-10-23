import { z } from 'zod';
import { HouseholdType } from '../../entities/resident.entity';

const contactSchema = z
  .string()
  .min(10, '연락처는 최소 10자 이상이어야 합니다.')
  .max(20, '연락처는 최대 20자까지 입력 가능합니다.')
  .transform((val) => val.replace(/-/g, '').trim())
  .refine((val) => /^010\d{7,8}$/.test(val), {
    message: '연락처 형식이 올바르지 않습니다.',
  });

const householderSchema = z.string().transform(val => {
  const normalized = val.trim().toLowerCase();
  if (['세대주', 'householder'].includes(normalized)) return HouseholdType.HOUSEHOLDER;
  if (['세대원', 'member'].includes(normalized)) return HouseholdType.MEMBER;
  throw new Error('세대주여부는 세대주, 세대원, HOUSEHOLDER, MEMBER 중 하나여야 합니다.');
});

export const csvResidentSchema = z.object({
  building: z.string().min(1, '동은 필수 입력 항목입니다.').max(6, '동은 최대 6자까지 입력 가능합니다.'),
  unitNumber: z.string().min(1, '호수는 필수 입력 항목입니다.').max(6, '호수는 최대 6자까지 입력 가능합니다.'),
  name: z.string().min(2, '이름은 필수 입력 항목입니다.').max(20, '이름은 최대 20자까지 입력 가능합니다.'),
  contact: contactSchema,
  isHouseholder: householderSchema,
});

export type CsvResidentDto = z.infer<typeof csvResidentSchema>;
