import { z } from 'zod';
import { ResidenceStatus } from '../../entities/resident.entity';

export type GetResidentListParams = {
  apartmentId: string;
  building?: string;
  unitNumber?: string;
  residenceStatus?: string;
  isRegistered?: boolean;
  name?: string;
  contact?: string;
}
export const filterSchema = z.object({
  building: z.string().optional(),
  unitNumber: z.string().optional(),
  residenceStatus: z.enum(ResidenceStatus).optional(),
  isRegistered: z.preprocess(val => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    return undefined;
  }, z.boolean().optional()),
  name: z.string().optional(),
  contact: z.string().optional(),
});