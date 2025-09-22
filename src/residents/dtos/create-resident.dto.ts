import { z } from 'zod';
import { HouseholdType, ResidentStatus } from '../../entities/resident.entity';
import { JoinStatus } from '../../entities/user.entity';

export const createResidentSchema = z.object({
  name: z.string().min(2, '이름은 필수 입력 항목입니다.').max(20, '이름은 최대 20자까지 입력 가능합니다.'),
  contact: z.string()
    .min(10, '연락처는 필수 입력 항목입니다.')
    .max(20, '연락처는 최대 20자까지 입력 가능합니다.')
    .regex(/^(01[016789])-(\d{3,4})-(\d{4})$/, '유효하지 않은 전화번호 형식입니다.'),
  building: z.string().min(1, '동은 필수 입력 항목입니다.').max(6, '동은 최대 6자까지 입력 가능합니다.'),
  unitNumber: z.string().min(1, '호수는 필수 입력 항목입니다.').max(6, '호수는 최대 6자까지 입력 가능합니다.'),
  isHouseholder: z.enum(HouseholdType),
});

export type CreateResidentDto = z.infer<typeof createResidentSchema>;

export interface ResidentResponseDto {
  id: string;
  userId: string | null;
  building: string;
  unitNumber: string;
  contact: string;
  name: string;
  email: string | null;
  residentStatus: ResidentStatus;
  isHouseholder: HouseholdType;
  isRegistered: boolean;
  approvalStatus: JoinStatus | 'PENDING';
}


