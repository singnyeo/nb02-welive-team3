import { Resident } from '../../entities/resident.entity';
import { ResidentResponseDto, ResidentResponseSchema } from '../dtos/create-resident.dto';

export const residentResponse = (resident: Resident): ResidentResponseDto => {
  return ResidentResponseSchema.parse({
    id: resident.id,
    userId: resident.user?.id ?? null,
    building: resident.building,
    unitNumber: resident.unitNumber,
    contact: resident.contact,
    email: resident.user?.email ?? null,
    name: resident.name,
    residenceStatus: resident.residenceStatus,
    isHouseholder: resident.isHouseholder,
    isRegistered: resident.isRegistered,
    approvalStatus: resident.user?.joinStatus ?? 'PENDING',
  })
}