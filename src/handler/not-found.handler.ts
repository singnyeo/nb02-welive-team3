import { Request, Response, NextFunction, RequestHandler } from 'express';
import { NotFoundError } from '../types/error.type';

export const notFoundHandler: RequestHandler = (_req: Request, _res: Response, next: NextFunction) => {
  const message = `요청된 페이지를 찾을 수 없습니다.`;
  next(new NotFoundError(message));
};
