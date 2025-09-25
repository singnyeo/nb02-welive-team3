import { AppDataSource } from "../config/data-source";
import { CreateResidentDto, ResidentResponseDto, ResidentResponseSchema } from "./dtos/create-resident.dto";
import { Resident, HouseholdType, ResidentStatus } from "../entities/resident.entity";
import { User } from "../entities/user.entity";
import { ConflictError, NotFoundError } from "../types/error.type";
import { Apartment } from "../entities/apartment.entity";
import { parseCsvBuffer } from './resident-csv.util';

/**
 * 개별 등록용
 */
export const createResident = async (
  dto: CreateResidentDto,
  apartment: Apartment
): Promise<ResidentResponseDto> => {
  const residentRepository = AppDataSource.getRepository(Resident);

  const existingResident = await residentRepository.findOne({
    where: {
      building: dto.building,
      unitNumber: dto.unitNumber,
      name: dto.name,
      apartment: { id: apartment.id },
    },
  });

  if (existingResident) {
    throw new ConflictError('이미 등록된 입주민입니다.');
  }

  const resident = residentRepository.create({
    ...dto,
    apartment,
  });

  const saved = await residentRepository.save(resident);

  const fullResident = await residentRepository.findOne({
    where: { id: saved.id },
    relations: ['user'],
  });

  if (!fullResident) {
    throw new NotFoundError('입주민 정보 조회에 실패했습니다.');
  }

  return ResidentResponseSchema.parse({
    id: fullResident.id,
    userId: fullResident.user?.id ?? null,
    building: fullResident.building,
    unitNumber: fullResident.unitNumber,
    contact: fullResident.contact,
    email: fullResident.user?.email ?? null,
    name: fullResident.name,
    residentStatus: fullResident.residentStatus,
    isHouseholder: fullResident.isHouseholder,
    isRegistered: fullResident.isRegistered,
    approvalStatus: fullResident.user?.joinStatus ?? 'PENDING',
  });
};

/**
 * 사용자로부터 입주민 리소스 생성
 */
export const createResidentFromUser = async (
  user: User,
  apartmentDong: string,
  apartmentHo: string,
  apartment: Apartment
): Promise<ResidentResponseDto> => {
  const residentRepository = AppDataSource.getRepository(Resident);

  const existingResident = await residentRepository.findOne({
    where: {
      name: user.name,
      building: apartmentDong,
      unitNumber: apartmentHo,
      apartment: { id: apartment.id },
    },
    relations: ['user'],
  });

  if (existingResident) {
    existingResident.user = user;
    existingResident.isRegistered = true;
    const updatedResident = await residentRepository.save(existingResident);

    return {
      id: updatedResident.id,
      userId: updatedResident.user?.id ?? null,
      building: updatedResident.building,
      unitNumber: updatedResident.unitNumber,
      contact: updatedResident.contact,
      email: updatedResident.user?.email ?? null,
      name: updatedResident.name,
      residentStatus: updatedResident.residentStatus,
      isHouseholder: updatedResident.isHouseholder,
      isRegistered: updatedResident.isRegistered,
      approvalStatus: updatedResident.user?.joinStatus ?? 'PENDING',
    };
  }

  const newResident = residentRepository.create({
    name: user.name,
    contact: user.contact,
    building: apartmentDong,
    unitNumber: apartmentHo,
    isHouseholder: HouseholdType.HOUSEHOLDER,
    residentStatus: ResidentStatus.RESIDENCE,
    isRegistered: true,
    user,
    apartment,
  });

  const savedResident = await residentRepository.save(newResident);

  return {
    id: savedResident.id,
    userId: savedResident.user?.id ?? null,
    building: savedResident.building,
    unitNumber: savedResident.unitNumber,
    contact: savedResident.contact,
    email: savedResident.user?.email ?? null,
    name: savedResident.name,
    residentStatus: savedResident.residentStatus,
    isHouseholder: savedResident.isHouseholder,
    isRegistered: savedResident.isRegistered,
    approvalStatus: savedResident.user?.joinStatus ?? 'PENDING',
  };
};

/**
 *  입주민 명부 csv 파일 업로드
 */

export const registerResidentsFromCsv = async (
  buffer: Buffer,
  apartment: Apartment
): Promise<{ count: number }> => {
  const parsedRows = await parseCsvBuffer(buffer);

  const repository = AppDataSource.getRepository(Resident);

  let count = 0;

  for (const row of parsedRows) {
    const existing = await repository.findOne({
      where: {
        building: row.building,
        unitNumber: row.unitNumber,
        name: row.name,
        apartment: { id: apartment.id }
      }
    });

    if (!existing) {
      const resident = repository.create({
        ...row,
        apartment,
        isRegistered: false,
        residentStatus: ResidentStatus.RESIDENCE
      });
      await repository.save(resident);
      count++;
    }
  }
  return { count };
};
