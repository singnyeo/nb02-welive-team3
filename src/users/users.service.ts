import { User, UserRole } from '../entities/user.entity';
import { BadRequestError, NotFoundError } from '../types/error.type';
import { AppDataSource } from '../config/data-source';
import { comparePassword, hashPassword } from '../utils/password.util';
import { uploadImage } from '../utils/file.util';

export const updateMe = async (
  id: string,
  currentPassword?: string,
  newPassword?: string,
  file?: Express.Multer.File
) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundError('존재하지 않는 사용자입니다.');
  }

  if (currentPassword && newPassword) {
    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      throw new BadRequestError('현재 비밀번호가 일치하지 않습니다.');
    }

    user.password = await hashPassword(newPassword);
  }

  if (file) {
    const fileUrl = await uploadImage(file, 'avatars', id);
    user.avatar = fileUrl;
  }

  await userRepository.save(user);
  return user;
};

export const getUserById = async (id: string) => {
  const userRepository = AppDataSource.getRepository(User);
  const user = await userRepository.findOne({ where: { id } });
  if (!user) {
    throw new NotFoundError('존재하지 않는 사용자입니다.');
  }
  return user;
};

export const getSuperAdmin = async () => {
  const userRepository = AppDataSource.getRepository(User);
  const superAdmin = await userRepository.findOne({ where: { role: UserRole.SUPER_ADMIN } });
  return superAdmin;
};
