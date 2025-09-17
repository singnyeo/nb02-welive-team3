import { MulterError } from 'multer';
import { HttpError } from '../types/error.type';
import { JsonWebTokenError } from 'jsonwebtoken';

export const isErrorInstanceOfHttp = (error: unknown): error is HttpError => error instanceof HttpError;
export const isErrorInstanceOfMulter = (error: unknown): error is MulterError => error instanceof MulterError;
export const isErrorInstanceOfJwt = (error: unknown): error is JsonWebTokenError => error instanceof JsonWebTokenError;
export const isErrorInstanceOfNode = (error: unknown): error is Error => error instanceof Error;
