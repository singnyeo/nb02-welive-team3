import z from 'zod';
import {
  LoginRequestBodySchema,
  SignupAdminRequestBodySchema,
  SignupRequestBodySchema,
  SignupSuperAdminRequestBodySchema,
} from './auth.dto';
import { AppDataSource } from '../config/data-source';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
  UnauthorizedError,
} from '../types/error.type';
import { UserRole } from '../entities/user.entity';
import { HouseholdType, Resident, ResidentStatus } from '../entities/resident.entity';
import { comparePassword, hashPassword } from '../utils/password.util';
import { ApprovalStatus } from '../entities/approvalStatus.entity';

// ============================
// : REPOSITORIES
// ============================
const userRepository = AppDataSource.getRepository('User');
const apartmentRepository = AppDataSource.getRepository('Apartment');
const residentRepository = AppDataSource.getRepository('Resident');
const complaintBoardRepository = AppDataSource.getRepository('ComplaintBoard');
const noticeBoardRepository = AppDataSource.getRepository('NoticeBoard');
const pollBoardRepository = AppDataSource.getRepository('PollBoard');

// ============================
// : SERVICE FUNCTIONS
// ============================

// SIGNUP(USER)
export const signup = async (body: z.infer<typeof SignupRequestBodySchema>) => {
  const { username, password, contact, name, email, role, apartmentName, apartmentDong, apartmentHo } = body;

  const existUser = await userRepository.findOne({
    where: [{ username }, { email }, { contact }],
  });
  if (existUser) {
    throw new ConflictError('이미 사용 중인 정보(아이디, 이메일, 전화번호)입니다');
  }

  const existApartment = await apartmentRepository.findOne({
    where: { name: apartmentName },
  });
  if (!existApartment) {
    throw new InternalServerError('회원가입을 진행하는 중 오류가 발생했습니다.');
  }
  const existApartmentId = existApartment.id;

  // 이미 등록된 입주민이 있는지 확인
  let resident;
  let joinStatus = ApprovalStatus.PENDING;
  let isRegistered = false;
  const existResidents = await apartmentRepository.find({
    where: { residents: { building: apartmentDong, unitNumber: apartmentHo } },
    relations: { residents: true },
  });

  if (existResidents.length > 0) {
    // 입주민 정보와 현재 들어온 정보가 일치하는지 확인
    const isMatch = existResidents.some((resident) => {
      return resident.residents.some((r: Resident) => r.name === name && r.contact === contact);
    });

    if (isMatch) {
      // 기존 입주민과 정보가 일치하면 자동 승인
      resident = existResidents[0].residents.find((r: Resident) => r.name === name && r.contact === contact);
      joinStatus = ApprovalStatus.APPROVED;
      isRegistered = resident.isRegistered;
      if (!isRegistered) {
        // 기존 입주민이 가입한 적이 없는 경우
        resident.isRegistered = true;
        await residentRepository.save(resident);
      }
    }
  } else {
    // 새로운 입주민 등록(승인 필요)
    resident = residentRepository.create({
      building: apartmentDong,
      unitNumber: apartmentHo,
      name: name,
      contact: contact,
      apartment: existApartment,
      apartmentId: existApartmentId,
      isHouseholder: HouseholdType.HOUSEHOLDER, // 가입 시점에는 HOUSEHOLDER 가 기본값
      residentStatus: ResidentStatus.RESIDENCE, // 가입 시점에는 RESIDENCE 가 기본값
      approvalStatus: ApprovalStatus.PENDING, // 가입 시점에는 PENDING 이 기본값
      isRegistered: true, // 위리브 회원가입으로 생성되기 때문에 자동으로 true 처리
    });
    await residentRepository.save(resident);
  }

  const residentId = resident.id;

  const hashedPassword = await hashPassword(password);

  const newUser = userRepository.create({
    username,
    password: hashedPassword,
    contact,
    name,
    email,
    apartment: existApartment,
    apartmentId: existApartmentId,
    resident,
    residentId,
    role: role || UserRole.ADMIN,
    joinStatus: joinStatus,
  });

  await userRepository.save(newUser);

  return newUser;
};

// SIGNUP(ADMIN)
export const signupAdmin = async (body: z.infer<typeof SignupAdminRequestBodySchema>) => {
  const {
    username,
    password,
    contact,
    name,
    email,
    description,
    startComplexNumber,
    endComplexNumber,
    startDongNumber,
    endDongNumber,
    startFloorNumber,
    endFloorNumber,
    startHoNumber,
    endHoNumber,
    role,
    apartmentName,
    apartmentAddress,
    apartmentManagementNumber,
  } = body;

  const existUser = await userRepository.findOne({ where: [{ username }, { email }, { contact }] });
  if (existUser) throw new ConflictError('이미 사용 중인 정보(아이디, 이메일, 전화번호)입니다');

  return await AppDataSource.transaction(async (manager) => {
    const userRepo = manager.withRepository(userRepository);
    const aptRepo = manager.withRepository(apartmentRepository);
    const noticeRepo = manager.withRepository(noticeBoardRepository);
    const complaintRepo = manager.withRepository(complaintBoardRepository);
    const pollRepo = manager.withRepository(pollBoardRepository);

    let apartment = await aptRepo.findOne({ where: { name: apartmentName } });

    if (!apartment) {
      apartment = aptRepo.create({
        name: apartmentName,
        address: apartmentAddress,
        officeNumber: apartmentManagementNumber,
        description,
        startComplexNumber,
        endComplexNumber,
        startDongNumber,
        endDongNumber,
        startFloorNumber,
        endFloorNumber,
        startHoNumber,
        endHoNumber,
      });
      await aptRepo.save(apartment);

      const newNoticeBoard = noticeRepo.create({ apartment });
      await noticeRepo.save(newNoticeBoard);
      const newComplaintBoard = complaintRepo.create({ apartment });
      await complaintRepo.save(newComplaintBoard);
      const newPollBoard = pollRepo.create({ apartment });
      await pollRepo.save(newPollBoard);

      apartment.noticeBoard = newNoticeBoard;
      apartment.complaintBoard = newComplaintBoard;
      apartment.pollBoard = newPollBoard;
      await aptRepo.save(apartment);
    }

    const hashedPassword = await hashPassword(password);

    const newAdmin = userRepo.create({
      username,
      password: hashedPassword,
      contact,
      name,
      email,
      apartment,
      apartmentId: apartment.id,
      role: role || UserRole.ADMIN,
      joinStatus: ApprovalStatus.PENDING,
      isActive: true,
    });
    await userRepo.save(newAdmin);

    apartment.adminId = newAdmin.id;
    await aptRepo.save(apartment);

    return newAdmin;
  });
};

// SIGNUP(SUPER_ADMIN)
export const signupSuperAdmin = async (body: z.infer<typeof SignupSuperAdminRequestBodySchema>) => {
  const { username, password, contact, name, email, role, joinStatus } = body;

  // 이미 사용 중인 username, email, contact 인지 확인
  const existUser = await userRepository.findOne({
    where: [{ username }, { email }, { contact }],
  });
  if (existUser) {
    throw new ConflictError('이미 사용 중인 정보(아이디, 이메일, 전화번호)입니다');
  }

  const hashedPassword = await hashPassword(password);

  const newSuperAdmin = userRepository.create({
    username,
    password: hashedPassword,
    contact,
    name,
    email,
    role: role || UserRole.SUPER_ADMIN,
    joinStatus: joinStatus || ApprovalStatus.APPROVED,
    isActive: true,
  });

  await userRepository.save(newSuperAdmin);

  return newSuperAdmin;
};

// LOGIN
export const login = async (body: z.infer<typeof LoginRequestBodySchema>) => {
  const { username, password } = body;
  const user = await userRepository.findOne({
    where: { username },
    relations: { apartment: true, resident: true },
  });
  if (!user) {
    throw new BadRequestError('사용자를 찾을 수 없습니다');
  }
  const isPasswordMatch = await comparePassword(password, user.password);
  if (!isPasswordMatch) {
    throw new UnauthorizedError('인증 실패(잘못된 아이디 또는 비밀번호)');
  }
  if (user.joinStatus !== ApprovalStatus.APPROVED) {
    throw new ForbiddenError('접근 권한이 없습니다(이미 로그인 상태이거나 비활성화된 계정입니다)');
  }

  user.lastLoginAt = new Date();
  await userRepository.save(user);

  return user;
};

export const addRefreshToken = async (userId: string, refreshToken: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });
  if (!user) {
    throw new NotFoundError('존재하지 않는 사용자입니다.');
  }
  user.refreshToken = refreshToken;
  await userRepository.save(user);
};

// LOGOUT
// 지금은 별다른 로직이 없습니다.
// 차후 로그아웃 후 토큰 블랙리스트 처리를 위한 로직이 추가될 경우 대비
export const logout = async (userId: string) => {
  const existUser = await userRepository.findOne({
    where: { id: userId },
  });
  if (!existUser) {
    throw new NotFoundError('존재하지 않는 사용자입니다.');
  }
  return;
};

export const removeRefreshToken = async (userId: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
  });

  if (!user) {
    throw new NotFoundError('존재하지 않는 사용자입니다.');
  }
  user.refreshToken = null;
  await userRepository.save(user);
  return;
};

// REFRESH
export const refresh = async (userId: string, refreshToken: string) => {
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: { apartment: true, resident: true },
  });
  if (!user) {
    throw new NotFoundError('존재하지 않는 사용자입니다.');
  }
  if (user.refreshToken !== refreshToken) {
    throw new UnauthorizedError('갱신 실패(다른 기기에서 로그인하여 토큰이 변경되었거나, 로그아웃하여 토큰이 삭제됨)');
  }

  return;
};

export const updateAdminStatus = async (adminId: string, status: ApprovalStatus) => {
  const admin = await userRepository.findOne({
    where: { id: adminId, role: UserRole.ADMIN },
    relations: { apartment: true },
  });
  if (!admin) {
    throw new NotFoundError('존재하지 않는 관리자입니다.');
  }

  admin.joinStatus = status;
  admin.isActive = true;

  await userRepository.save(admin);

  const apartment = admin.apartment;

  if (apartment) {
    apartment.adminId = admin.id;
    apartment.apartmentStatus = admin.joinStatus;
    await apartmentRepository.save(apartment);
  }

  return;
};

export const updateAdminsStatus = async (status: ApprovalStatus) => {
  // status 가 pending 인 모든 admin 계정을 찾아서 status 업데이트
  const admins = await userRepository.find({
    where: { role: UserRole.ADMIN, joinStatus: ApprovalStatus.PENDING },
    relations: { apartment: true },
  });

  if (admins.length === 0) {
    throw new NotFoundError('존재하는 관리자가 없습니다.');
  }

  for (const admin of admins) {
    admin.joinStatus = status;
    admin.isActive = true;
    await userRepository.save(admin);

    const apartment = admin.apartment;
    if (apartment) {
      apartment.adminId = admin.id;
      apartment.apartmentStatus = admin.joinStatus;
      await apartmentRepository.save(apartment);
    }
  }

  return;
};
