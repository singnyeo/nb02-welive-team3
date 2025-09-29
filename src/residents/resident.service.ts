import { AppDataSource } from "../config/data-source";
import { CreateResidentDto, ResidentResponseDto } from "./dtos/create-resident.dto";
import { Resident, HouseholdType, ResidentStatus } from "../entities/resident.entity";
import { User } from "../entities/user.entity";
import { ConflictError, NotFoundError } from "../types/error.type";

/**
 * 개별 등록용
 */
export const createResident = async (dto: CreateResidentDto): Promise<ResidentResponseDto> => {
  const residentRepository = AppDataSource.getRepository(Resident);

  const existingResident = await residentRepository.findOneBy({
    building: dto.building,
    unitNumber: dto.unitNumber,
    name: dto.name,
    contact: dto.contact,
  });

  if (existingResident) {
    throw new ConflictError('이미 등록된 입주민입니다.');
  }

  const resident = residentRepository.create(dto);

  // resident 엔티티를 먼저 저장
  const saved = await residentRepository.save(resident);

  // 저장된 엔티티의 ID를 이용해 user 관계를 포함한 전체 정보를 조회
  const fullResident = await residentRepository.findOne({
    where: { id: saved.id },
    relations: ['user'],
  });

  if (!fullResident) {
    throw new NotFoundError('입주민 정보 조회에 실패했습니다.');
  }

  const responseData: ResidentResponseDto = {
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
  };

  return responseData;
};

/**
 * 사용자로부터 입주민 리소스 생성
 */
export const createResidentFromUser = async (
  user: User,
  apartmentDong: string,
  apartmentHo: string
): Promise<ResidentResponseDto> => {
  const residentRepository = AppDataSource.getRepository(Resident);

  // 동일 정보로 등록된 resident가 있는 경우 → 연결
  const existingResident = await residentRepository.findOne({
    where: {
      name: user.name,
      contact: user.contact,
      building: apartmentDong,
      unitNumber: apartmentHo,
    },
    relations: ['user'],
  });

  if (existingResident) {
    existingResident.user = user;
    existingResident.isRegistered = true;
    const updatedResident = await residentRepository.save(existingResident);

    const responseData: ResidentResponseDto = {
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
    return responseData;
  }

  // 없으면 새로 생성
  const newResident = residentRepository.create({
    name: user.name,
    contact: user.contact,
    building: apartmentDong,
    unitNumber: apartmentHo,
    isHouseholder: HouseholdType.HOUSEHOLDER,
    residentStatus: ResidentStatus.RESIDENCE,
    isRegistered: true,
    user,
  });

  const savedResident = await residentRepository.save(newResident);

  const responseData: ResidentResponseDto = {
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
  return responseData;
};
