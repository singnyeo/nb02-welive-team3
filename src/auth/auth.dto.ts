import { z } from 'zod';

const RoleEnum = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);
const JoinStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const SignupRequestSchema = z.object({
  username: z.string().min(3).max(128),
  password: z.string().min(8).max(128),
  contact: z.string().min(10).max(11),
  name: z.string().min(1).max(32),
  email: z.email().min(5).max(254),
  role: RoleEnum.default('USER'),
  apartmentName: z.string().min(1).max(64),
  apartmentDong: z.string().min(1).max(8),
  apartmentHo: z.string().min(1).max(8),
});

export const SignupResponseSchema = z.object({
  id: z.uuid(),
  email: z.email().min(5).max(254),
  role: RoleEnum,
  joinStatus: JoinStatusEnum,
  isActive: z.boolean(),
});

export const SignupAdminRequestSchema = z.object({
  username: z.string().min(3).max(128),
  password: z.string().min(8).max(128),
  contact: z.string().min(10).max(11),
  name: z.string().min(1).max(32),
  email: z.email().min(5).max(254),
  role: RoleEnum.default('ADMIN'),
  description: z.string().min(1).max(256),
  startComplexNumber: z.number().int().min(1).max(9999),
  endComplexNumber: z.number().int().min(1).max(9999),
});

export const SignupAdminResponseSchema = z.object({});

export const SignupSuperAdminRequestSchema = z.object({
  username: z.string().min(3).max(128),
  password: z.string().min(8).max(128),
  contact: z.string().min(10).max(11),
  name: z.string().min(1).max(32),
  email: z.email().min(5).max(254),
  role: RoleEnum.default('SUPER_ADMIN'),
});
