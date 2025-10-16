import fs from 'fs';
import { Response, Request, NextFunction } from 'express';
import { createResidentSchema } from './dtos/create-resident.dto';
import * as ResidentService from './resident.service';
import { BadRequestError, NotFoundError, InternalServerError } from '../types/error.type';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/user.entity';
import { RESIDENT_CSV_TEMPLATE_PATH } from './resident.constants';
import { UpdatedResidentDto } from './dtos/update-resident.dto';
import { filterSchema } from './dtos/resident-filter.dto';

/**
 * 개별 입주민 등록
 */
export const createResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createResidentSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new BadRequestError('입주민 등록 요청 데이터가 유효하지 않습니다.');
    }

    const adminUser = req.user as User;

    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }

    const residentDto = await ResidentService.createResident(parseResult.data, adminUser.apartment);

    return res.status(201).json(residentDto);
  } catch (error: unknown) {
    return next(error);
  }
};

/**
 * 사용자로부터 입주민 등록
 */
export const createResidentFromUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const { apartmentDong, apartmentHo } = req.body;

    if (!userId) {
      throw new BadRequestError('userId가 전달되지 않았습니다.');
    }

    if (!apartmentDong || !apartmentHo) {
      throw new BadRequestError('아파트 동과 호수는 필수 입력값입니다.');
    }

    const adminUser = req.user as User;

    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('해당 사용자 정보를 찾을 수 없습니다.');
    }

    const residentDto = await ResidentService.createResidentFromUser(
      user,
      apartmentDong,
      apartmentHo,
      adminUser.apartment
    );

    return res.status(201).json(residentDto);
  } catch (error: unknown) {
    return next(error);
  }
};

/**
 * 입주민 명부 템플릿 다운로드
 */
export const downloadResidentTemplate = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const filePath = RESIDENT_CSV_TEMPLATE_PATH;

    if (!fs.existsSync(filePath)) {
      throw new InternalServerError('템플릿 파일이 존재하지 않습니다.');
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="residents.csv"; filename*=UTF-8''입주민명부_템플릿.csv`
    );

    const fileStream = fs.createReadStream(filePath);
    return fileStream.pipe(res);
  } catch (error: unknown) {
    return next(error);
  }
};

/**
 * CSV 파일로 입주민 명부 업로드
 */
export const uploadResidentsFromFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;

    if (!file) {
      throw new BadRequestError('CSV 파일이 필요합니다.');
    }

    const adminUser = req.user as User;

    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }

    const { count } = await ResidentService.registerResidentsFromCsv(file.buffer, adminUser.apartment);

    return res.status(201).json({
      message: `${count}명의 입주민이 등록되었습니다.`,
      count,
    });
  } catch (error: unknown) {
    return next(error);
  }
};

/**
 * 입주민 목록 조회
 */
export const residentList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminUser = req.user as User;

    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }

    const parseResult = filterSchema.safeParse(req.query);

    if (!parseResult.success) {
      throw new BadRequestError('입주민 목록 조회 요청 데이터가 유효하지 않습니다.');
    }

    const filter = parseResult.data;

    const residents = await ResidentService.getResidentList({
      apartmentId: adminUser.apartment.id,
      building: filter.building,
      unitNumber: filter.unitNumber,
      residenceStatus: filter.residenceStatus,
      isRegistered: filter.isRegistered === 'true',
      name: filter.name,
      contact: filter.contact,
    });

    return res.status(200).json({
      residents,
      count: residents.length,
      message: '입주민 목록 조회 성공',
    });
  }
  catch (error: unknown) {
    return next(error);
  }
}

/** 
 * 입주민 상세 조회
 */
export const residentDetail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminUser = req.user as User;

    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }
    if (!id) {
      throw new BadRequestError('입주민 Id가 필요합니다.');
    }

    const resident = await ResidentService.residentListDetail(id, adminUser.apartment.id);

    return res.status(200).json(resident);
  } catch (error: unknown) {
    return next(error);
  }
};

/**
 * 입주민 정보 수정
 */
export const updateResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const adminUser = req.user as User;
    const updateData: UpdatedResidentDto = req.body;

    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }
    if (!id) {
      throw new BadRequestError('입주민 Id가 필요합니다.');
    }

    const updatedResident = await ResidentService.updateResident(id, adminUser.apartment.id, updateData);

    return res.status(200).json(updatedResident);

  } catch (error: unknown) {
    return next(error);
  }
}

/**
 * 입주민 삭제
 */
export const deleteResident = async (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;
  const adminUser = req.user as User;

  try {
    if (!adminUser?.apartment) {
      throw new BadRequestError('관리자 계정에 연결된 아파트 정보가 없습니다.');
    }
    if (!id) {
      throw new BadRequestError('입주민 Id가 필요합니다.');
    }

    await ResidentService.deleteResident(id, adminUser.apartment.id);

    return res.status(200).json({ message: '작업이 성공적으로 완료되었습니다.' });
  } catch (error: unknown) {
    return next(error);
  }
};
