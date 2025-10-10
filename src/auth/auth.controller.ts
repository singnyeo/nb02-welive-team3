import { RequestHandler } from 'express';
import {
  LoginRequestSchema,
  LoginResponseSchema,
  LogoutRequestSchema,
  RefreshRequestSchema,
  RefreshResponseSchema,
  SignupAdminRequestBodySchema,
  SignupAdminResponseSchema,
  SignupRequestSchema,
  SignupResponseSchema,
  SignupSuperAdminRequestSchema,
  SignupSuperAdminResponseSchema,
  UpdateAdminsStatusRequestSchema,
  UpdateAdminStatusRequestSchema,
} from './auth.dto';
import { BadRequestError, UnauthorizedError } from '../types/error.type';
import {
  addRefreshToken,
  login,
  logout,
  refresh,
  removeRefreshToken,
  signup,
  signupAdmin,
  signupSuperAdmin,
  updateAdminsStatus,
  updateAdminStatus,
} from './auth.service';
import z from 'zod';
import {
  deleteAccessToken,
  deleteRefreshToken,
  generateAccessToken,
  generateRefreshToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../utils/token.util';
import { Payload } from '../types/payload.type';

export const handleSignup: RequestHandler = async (req, res) => {
  const result = SignupRequestSchema.safeParse({ body: req.body });
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.');
  }

  const signedupUser = await signup(result.data.body);

  const response: z.infer<typeof SignupResponseSchema> = {
    id: signedupUser.id,
    name: signedupUser.name,
    email: signedupUser.email,
    role: signedupUser.role,
    joinStatus: signedupUser.joinStatus,
    isActive: signedupUser.isActive,
  };
  res.status(201).json(response);
};

export const handleSignupAdmin: RequestHandler = async (req, res) => {
  const body = SignupAdminRequestBodySchema.safeParse(req.body);
  if (!body.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.');
  }

  const signedupUser = await signupAdmin(body.data);

  const response: z.infer<typeof SignupAdminResponseSchema> = {
    id: signedupUser.id,
    name: signedupUser.name,
    email: signedupUser.email,
    role: signedupUser.role,
    joinStatus: signedupUser.joinStatus,
    isActive: signedupUser.isActive,
  };
  res.status(201).json(response);
};

export const handleSignupSuperAdmin: RequestHandler = async (req, res) => {
  const result = SignupSuperAdminRequestSchema.safeParse(req);
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.');
  }

  const signedupUser = await signupSuperAdmin(result.data.body);

  const response: z.infer<typeof SignupSuperAdminResponseSchema> = {
    id: signedupUser.id,
    name: signedupUser.name,
    email: signedupUser.email,
    role: signedupUser.role,
    joinStatus: signedupUser.joinStatus,
    isActive: signedupUser.isActive,
  };

  res.status(201).json(response);
};

export const handleLogin: RequestHandler = async (req, res) => {
  const result = LoginRequestSchema.safeParse({ body: req.body });
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다');
  }

  const loggedinUser = await login(result.data.body);

  const response: z.infer<typeof LoginResponseSchema> = {
    id: loggedinUser.id,
    name: loggedinUser.name,
    email: loggedinUser.email,
    role: loggedinUser.role,
    joinStatus: loggedinUser.joinStatus,
    isActive: loggedinUser.isActive,
    apartmentId: loggedinUser.apartmentId,
    apartmentName: loggedinUser.apartment?.name || null,
    residentDong: loggedinUser.resident?.dong || null,
    boardIds: {
      COMPLAINT: loggedinUser.apartment?.complaintBoard?.id || null,
      NOTICE: loggedinUser.apartment?.noticeBoard?.id || null,
      POLL: loggedinUser.apartment?.pollBoard?.id || null,
    },
    username: loggedinUser.username,
    contact: loggedinUser.contact,
    avatar: loggedinUser.avatar || null,
  };

  const payload: Payload = { id: loggedinUser.id, role: loggedinUser.role };

  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await addRefreshToken(loggedinUser.id, refreshToken);

  setAccessToken(res, accessToken);
  setRefreshToken(res, refreshToken);

  res.status(200).json(response);
};

export const handleLogout: RequestHandler = async (req, res) => {
  const result = LogoutRequestSchema.safeParse({ user: req.user });
  if (!result.success) {
    return new UnauthorizedError('로그아웃 중 오류가 발생했습니다.');
  }
  const { id } = result.data.user;

  await logout(id);

  deleteAccessToken(res);
  deleteRefreshToken(res);

  await removeRefreshToken(id);

  res.status(204).json('');
};

export const handleRefresh: RequestHandler = async (req, res) => {
  const result = RefreshRequestSchema.safeParse(req);
  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다.');
  }

  const { id } = result.data.user;
  const refreshToken = getRefreshToken(req);
  if (!refreshToken) {
    throw new UnauthorizedError('인증 실패(로그인 필요)');
  }

  await refresh(id, refreshToken);

  const payload: Payload = { id: result.data.user.id, role: result.data.user.role };
  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);

  setAccessToken(res, newAccessToken);
  setRefreshToken(res, newRefreshToken);

  await addRefreshToken(id, newRefreshToken);

  const response: z.infer<typeof RefreshResponseSchema> = { message: '토큰이 성공적으로 갱신되었습니다.' };

  res.status(200).json(response);
};

export const handleUpdateAdminStatus: RequestHandler = async (req, res) => {
  const result = UpdateAdminStatusRequestSchema.safeParse({
    params: req.params,
    body: req.body,
  });

  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다');
  }

  const { id } = result.data.params;
  const { status } = result.data.body;

  await updateAdminStatus(id, status);

  res.status(200).send('작업이 성공적으로 완료되었습니다');
};

export const handleUpdateAdminsStatus: RequestHandler = async (req, res) => {
  const result = UpdateAdminsStatusRequestSchema.safeParse({
    body: req.body,
  });

  if (!result.success) {
    throw new BadRequestError('잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다');
  }

  const { status } = result.data.body;

  await updateAdminsStatus(status);

  res.status(200).send('작업이 성공적으로 완료되었습니다');
};

export const handleUpdateResidentStatus: RequestHandler = (_req, res) => {
  res.status(200).send('handleUpdateResidentStatus');
};

export const handleUpdateResidentsStatus: RequestHandler = (_req, res) => {
  res.status(200).send('handleUpdateResidentsStatus');
};

export const handleUpdateAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleUpdateAdmin');
};

export const handleDeleteAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleDeleteAdmin');
};

export const handleCleanup: RequestHandler = (_req, res) => {
  res.status(200).send('handleCleanup');
};
