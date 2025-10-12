import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { Payload } from '../types/payload.type';
import { InternalServerError } from '../types/error.type';
import env from '../config/env';

// ACCESS_TOKEN 생성
export const generateAccessToken = (payload: Payload): string => {
  const expiresIn = env.JWT_ACCESS_EXPIRATION;
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn });
};

// REFRESH_TOKEN 생성
export const generateRefreshToken = (payload: Payload): string => {
  const expiresIn = env.JWT_REFRESH_EXPIRATION;
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn });
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
  res.cookie('access_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: env.JWT_ACCESS_EXPIRATION,
  });
};

export const getAccessToken = (req: Request): string | undefined => {
  return req.cookies?.['access_token'];
};

export const deleteAccessToken = (res: Response) => {
  res.clearCookie('access_token');
};

// [!] 배포 시 secure: true로 변경 필요(https에서만 쿠키 전송)
export const setRefreshToken = (res: Response, token: string) => {
  res.cookie('refresh_token', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'strict',
    maxAge: env.JWT_REFRESH_EXPIRATION,
  });
};

export const getRefreshToken = (req: Request): string | undefined => {
  return req.cookies?.['refresh_token'];
};

export const deleteRefreshToken = (res: Response) => {
  res.clearCookie('refresh_token');
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
