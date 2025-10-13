import { RequestHandler } from 'express';
import { GetApartmentRequestSchema, GetApartmentsRequestSchema } from './apartments.dto';
import { BadRequestError } from '../types/error.type';
import { getApartment, getApartments } from './apartments.service';

export const handleGetApartments: RequestHandler = async (req, res) => {
  const result = GetApartmentsRequestSchema.safeParse({ query: req.query });
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.');
  }
  const gotApartments = await getApartments(result.data.query);

  return res.status(200).json({
    apartments: gotApartments,
  });
};

export const handleGetApartment: RequestHandler = async (req, res) => {
  const result = GetApartmentRequestSchema.safeParse(req);
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.');
  }

  const gotApartment = await getApartment(result.data.params);

  return res.status(200).json(gotApartment);
};
