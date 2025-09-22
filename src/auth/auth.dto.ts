import { z } from 'zod';
<<<<<<< HEAD
import { JoinStatus, UserRole } from '../entities/user.entity';

// =============================
// : ZOD CUSTOM TYPES
// =============================
const id = z.uuid();
const email = z.email();
const username = z.string().min(3).max(128);
const password = z
  .string()
  .min(8)
  .max(128)
  .regex(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>]).{8,128}$/, {
    message: '비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.',
  });
const name = z.string().min(1).max(64);
const contact = z.string().max(11);
const role = z.enum(UserRole);
const joinStatus = z.enum(JoinStatus);
const apartmentName = z.string().min(1).max(64);
const apartmentDong = z.string().min(1).max(8);
const apartmentHo = z.string().min(1).max(8);
const isActive = z.boolean();
const description = z.string().min(1).max(256);
const avatar = z.url().nullable();
const startComplexNumber = z.number().int().min(1).max(999);
const endComplexNumber = z.number().int().min(1).max(999);
const startDongNumber = z.number().int().min(1).max(999);
const endDongNumber = z.number().int().min(1).max(999);
const startFloorNumber = z.number().int().min(1).max(999);
const endFloorNumber = z.number().int().min(1).max(999);
const startHoNumber = z.number().int().min(1).max(999);
const endHoNumber = z.number().int().min(1).max(999);
const apartmentAddress = z.string().min(1).max(512);
const apartmentManagementNumber = z.string().min(1).max(11);
const apartmentId = z.uuid().nullable();
const residentDong = z.string().min(1).max(8).nullable();
const boardIds = z.object({
  COMPLAINT: z.uuid(),
  NOTICE: z.uuid(),
  POLL: z.uuid(),
});
const message = z.string().min(1).max(128);
const user = z.object({ id: id, role: role });

// =============================
// : ZOD SCHEMAS
// =============================

export const AuthRequestParamsSchema = z.object({
  id: id,
});

export const SignupRequestBodySchema = z.object({
  username: username,
  password: password,
  contact: contact,
  name: name,
  email: email,
  role: role.default(UserRole.USER),
  apartmentName: apartmentName,
  apartmentDong: apartmentDong,
  apartmentHo: apartmentHo,
});

export const SignupRequestSchema = z.object({
  body: SignupRequestBodySchema,
});

export const SignupResponseSchema = z.object({
  id: id,
  name: name,
  email: email,
  role: role,
  joinStatus: joinStatus,
  isActive: isActive,
});

export const SignupAdminRequestBodySchema = z.object({
  username: username,
  password: password,
  contact: contact,
  name: name,
  email: email,
  role: role.default(UserRole.ADMIN),
  description: description,
  startComplexNumber: startComplexNumber,
  endComplexNumber: endComplexNumber,
  startDongNumber: startDongNumber,
  endDongNumber: endDongNumber,
  startFloorNumber: startFloorNumber,
  endFloorNumber: endFloorNumber,
  startHoNumber: startHoNumber,
  endHoNumber: endHoNumber,
  apartmentName: apartmentName,
  apartmentAddress: apartmentAddress,
  apartmentManagementNumber: apartmentManagementNumber,
});

export const SignupAdminRequestSchema = z.object({
  body: SignupAdminRequestBodySchema,
});

export const SignupAdminResponseSchema = z.object({
  id: id,
  name: name,
  email: email,
  role: role,
  joinStatus: joinStatus,
  isActive: isActive,
});

export const SignupSuperAdminRequestBodySchema = z.object({
  username: username,
  password: password,
  contact: contact,
  name: name,
  email: email,
  role: role.default(UserRole.SUPER_ADMIN),
  joinStatus: joinStatus.default(JoinStatus.APPROVED),
});

export const SignupSuperAdminRequestSchema = z.object({
  body: SignupSuperAdminRequestBodySchema,
});

export const SignupSuperAdminResponseSchema = z.object({
  id: id,
  name: name,
  email: email,
  role: role,
  joinStatus: joinStatus,
  isActive: isActive,
});

export const LoginRequestBodySchema = z.object({
  username: username,
  password: password,
});

export const LoginRequestSchema = z.object({
  body: LoginRequestBodySchema,
});

export const LoginResponseSchema = z.object({
  id: id,
  name: name,
  email: email,
  role: role,
  joinStatus: joinStatus,
  isActive: isActive,
  apartmentId: apartmentId,
  apartmentName: apartmentName,
  residentDong: residentDong,
  boardIds: boardIds,
  username: username,
  contact: contact,
  avatar: avatar,
});

export const LogoutRequestSchema = z.object({
  user: user,
});

export const LogoutResponseSchema = z.object({});

export const RefreshRequestSchema = z.object({
  user: user,
});

export const RefreshResponseSchema = z.object({
  message: message,
});

export const UpdateAdminStatusRequestSchema = z.object({
  status: joinStatus,
});

export const UpdateAdminStatusResponseSchema = z.object({
  message: message,
});

export const UpdateAdminsStatusRequestSchema = z.object({
  status: joinStatus,
});

export const UpdateAdminsStatusResponseSchema = z.object({
  message: message,
});

export const UpdateResidentStatusRequestSchema = z.object({
  status: joinStatus,
});

export const UpdateResidentStatusResponseSchema = z.object({
  message: message,
});

export const UpdateResidentsStatusRequestSchema = z.object({
  status: joinStatus,
});

export const UpdateResidentsStatusResponseSchema = z.object({
  message: z.string().min(1).max(128),
});

export const UpdateAdminRequestSchema = z.object({
  contact: contact.optional(),
  email: email.optional(),
  description: description.optional(),
  apartmentName: apartmentName.optional(),
  apartmentAddress: apartmentAddress.optional(),
  apartmentManagementNumber: apartmentManagementNumber.optional(),
});

export const UpdateAdminResponseSchema = z.object({
  message: message,
});

export const DeleteAdminRequestSchema = z.object({
  params: AuthRequestParamsSchema,
});

export const DeleteAdminResponseSchema = z.object({
  message: message,
});

export const CleanupRequestSchema = z.object({});

export const CleanupResponseSchema = z.object({
  message: message,
=======

const RoleEnum = z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']);
const JoinStatusEnum = z.enum(['PENDING', 'APPROVED', 'REJECTED']);

export const SignupRequestSchema = z.object({
  body: SignupRequestBodySchema,
});

export const SignupResponseSchema = z.object({
  id: id,
  name: name,
  email: email,
  role: role,
  joinStatus: joinStatus,
  isActive: isActive,
});

export const SignupAdminRequestBodySchema = z.object({
  username: username,
  password: password,
  contact: contact,
  name: name,
  email: email,
  role: role.default(UserRole.ADMIN),
  description: description,
  startComplexNumber: startComplexNumber,
  endComplexNumber: endComplexNumber,
  startDongNumber: startDongNumber,
  endDongNumber: endDongNumber,
  startFloorNumber: startFloorNumber,
  endFloorNumber: endFloorNumber,
  startHoNumber: startHoNumber,
  endHoNumber: endHoNumber,
  apartmentName: apartmentName,
  apartmentAddress: apartmentAddress,
  apartmentManagementNumber: apartmentManagementNumber,
});

export const SignupAdminRequestSchema = z.object({
  body: SignupAdminRequestBodySchema,
});

export const SignupAdminResponseSchema = z.object({
  id: id,
  name: name,
  email: email,
  role: role,
  joinStatus: joinStatus,
  isActive: isActive,
});

export const SignupSuperAdminRequestBodySchema = z.object({
  username: username,
  password: password,
  contact: contact,
  name: name,
  email: email,
  role: role.default(UserRole.SUPER_ADMIN),
  joinStatus: joinStatus.default(JoinStatus.APPROVED),
});

export const SignupSuperAdminRequestSchema = z.object({
  username: z.string().min(3).max(128),
  password: z.string().min(8).max(128),
  contact: z.string().min(10).max(11),
  name: z.string().min(1).max(32),
  email: z.email().min(5).max(254),
  role: RoleEnum.default('SUPER_ADMIN'),
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
});
