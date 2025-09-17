import { Request } from 'express';

export const getIp = (req: Request): string => req.ip || 'unknown';
export const getUrl = (req: Request): string => req.url || 'unknown';
export const getMethod = (req: Request): string => req.method || 'unknown';
