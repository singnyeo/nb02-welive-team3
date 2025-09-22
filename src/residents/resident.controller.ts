import { Response, Request, NextFunction } from "express";
import { createResidentSchema } from "./dtos/create-resident.dto";
import * as ResidentService from "./resident.service";
import { BadRequestError, NotFoundError } from "../types/error.type";
import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";

export const createResident = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parseResult = createResidentSchema.safeParse(req.body);

    if (!parseResult.success) {
      throw new BadRequestError('입주민 등록 요청 데이터가 유효하지 않습니다');
    }

    const residentDto = await ResidentService.createResident(parseResult.data);

    res.status(201).json({
      ...residentDto,
    });
  } catch (error: unknown) {
    next(error);
  }
};

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

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundError('해당 사용자 정보를 찾을 수 없습니다.');
    }

    const residentDto = await ResidentService.createResidentFromUser(user, apartmentDong, apartmentHo);

    res.status(201).json({
      ...residentDto,
    });
  } catch (error: unknown) {
    next(error);
  }
};