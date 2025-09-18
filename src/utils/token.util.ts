import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Payload } from '../types/payload.type';
import { InternalServerError } from '../types/error.type';
import env from '../config/env';

// ACCESS_TOKEN 생성
export const generateAccessToken = (payload: Payload): string => {
<<<<<<< HEAD
  const expiresIn = env.JWT_ACCESS_EXPIRATION;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
=======
  const { _iat, _exp, ...other } = payload;
  const expiresIn = env.JWT_ACCESS_EXPIRATION;
  return jwt.sign(other, env.JWT_ACCESS_SECRET, { expiresIn });
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
};

// REFRESH_TOKEN 생성
export const generateRefreshToken = (payload: Payload): string => {
<<<<<<< HEAD
  const expiresIn = env.JWT_REFRESH_EXPIRATION;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
=======
  const { _iat, _exp, ...other } = payload;
  const expiresIn = env.JWT_REFRESH_EXPIRATION;
  return jwt.sign(other, env.JWT_REFRESH_SECRET, { expiresIn });
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
};

// ACCESS_TOKEN 검증
export const verifyAccessToken = (token: string): Payload => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as Payload;
};

// REFRESH_TOKEN 검증
export const verifyRefreshToken = (token: string): Payload => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as Payload;
};

// [!] 배포 시 secure: true로 변경 필요(https에서만 쿠키 전송)
export const setAccessToken = (res: Response, token: string) => {
  res.cookie('accessToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: env.JWT_ACCESS_EXPIRATION,
  });
};

export const getAccessToken = (req: Request): string | undefined => {
  return req.cookies?.['accessToken'];
};

export const deleteAccessToken = (res: Response) => {
  res.clearCookie('accessToken');
};

// [!] 배포 시 secure: true로 변경 필요(https에서만 쿠키 전송)
export const setRefreshToken = (res: Response, token: string) => {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: env.JWT_REFRESH_EXPIRATION,
  });
};

export const getRefreshToken = (req: Request): string | undefined => {
  return req.cookies?.['refreshToken'];
};

export const deleteRefreshToken = (res: Response) => {
  res.clearCookie('refreshToken');
};

// 남은 토큰 기간 확인
export const getTokenRemainSeconds = (token: string): number => {
  const decoded = jwt.decode(token) as jwt.JwtPayload | null;
  if (!decoded) {
    throw new InternalServerError('invalid token: decode failed');
  }

  const { exp } = decoded;
  if (typeof exp !== 'number') {
    throw new InternalServerError('invalid token: missing exp');
  }

  const nowInSeconds = Math.floor(Date.now() / 1000);
  return exp - nowInSeconds;
};
