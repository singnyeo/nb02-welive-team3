import { TestAppDataSource } from '../../config/test-data-source';
import { User, UserRole } from '../../entities/user.entity';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';
import { BadRequestError, NotFoundError } from '../../types/error.type';
import { comparePassword, hashPassword } from '../../utils/password.util';
import { Repository } from 'typeorm';
import * as fileUtil from '../../utils/file.util';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { updateMe, getUserById, getSuperAdmin } from '../users.service';

const createTestUser = async (userData: Partial<User>) => {
  const userRepo = TestAppDataSource.getRepository(User);
  const hashedPassword = await hashPassword(userData.password || 'password1234!');

  return userRepo.save({
    username: 'testuser',
    name: '테스트유저',
    contact: `010-${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
    email: `${Math.random()}@test.com`,
    role: UserRole.USER,
    joinStatus: ApprovalStatus.APPROVED,
    ...userData,
    password: hashedPassword,
  });
};

const fakeFile: Express.Multer.File = {
  fieldname: 'file',
  originalname: 'avatar.jpg',
  encoding: '7bit',
  mimetype: 'image/jpeg',
  size: 12345,
  buffer: Buffer.from('fake-image-data'),
  stream: new (require('stream').Readable)(),
  destination: '',
  filename: '',
  path: '',
};

describe('UsersService', () => {
  let userRepo: Repository<User>;
  let uploadImageSpy: jest.SpyInstance;

  beforeEach(() => {
    userRepo = TestAppDataSource.getRepository(User);

    uploadImageSpy = jest.spyOn(fileUtil, 'uploadImage').mockResolvedValue('https-fake-url/avatar.jpg');
  });

  afterEach(() => {
    uploadImageSpy.mockRestore();
  });

  describe('updateMe', () => {
    it('비밀번호를 성공적으로 변경한다', async () => {
      const user = await createTestUser({ password: 'password1234!' });
      await updateMe(user.id, 'password1234!', 'password4567!');
      const updatedUser = await userRepo.findOneBy({ id: user.id });
      const isNewPasswordMatch = await comparePassword('password4567!', updatedUser!.password);
      const isOldPasswordMatch = await comparePassword('password1234!', updatedUser!.password);
      expect(isNewPasswordMatch).toBe(true);
      expect(isOldPasswordMatch).toBe(false);
    });

    it('현재 비밀번호가 일치하지 않으면 BadRequestError를 던진다', async () => {
      const user = await createTestUser({ password: 'password1234!' });
      await expect(updateMe(user.id, 'wrongPass!', 'password1234!')).rejects.toThrow(BadRequestError);
    });

    it('파일을 업로드하고 avatar URL을 업데이트한다', async () => {
      const user = await createTestUser({});
      await updateMe(user.id, undefined, undefined, fakeFile);

      expect(uploadImageSpy).toHaveBeenCalledTimes(1);
      expect(uploadImageSpy).toHaveBeenCalledWith(fakeFile, 'avatars', user.id);

      const userInDb = await userRepo.findOneBy({ id: user.id });
      expect(userInDb!.avatar).toBe('https-fake-url/avatar.jpg');
    });

    it('비밀번호 변경과 파일 업로드를 동시에 수행한다', async () => {
      const user = await createTestUser({ password: 'currentPass123!' });
      const updatedUser = await updateMe(user.id, 'currentPass123!', 'newPass456!', fakeFile);
      const isNewPasswordMatch = await comparePassword('newPass456!', updatedUser.password);
      expect(isNewPasswordMatch).toBe(true);

      expect(uploadImageSpy).toHaveBeenCalledTimes(1);

      const userInDb = await userRepo.findOneBy({ id: user.id });
      expect(userInDb!.avatar).toBe('https-fake-url/avatar.jpg');
    });

    it('존재하지 않는 유저면 NotFoundError를 던진다', async () => {
      const validButNonExistentUUID = '123e4567-e89b-12d3-a456-426614174000';
      await expect(updateMe(validButNonExistentUUID, 'pass1', 'pass2', fakeFile)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getUserById', () => {
    it('ID로 유저를 성공적으로 찾는다', async () => {
      const user = await createTestUser({ username: 'findme' });
      const foundUser = await getUserById(user.id);
      expect(foundUser.id).toBe(user.id);
      expect(foundUser.username).toBe('findme');
    });

    it('ID로 유저를 찾지 못하면 NotFoundError를 던진다', async () => {
      const validButNonExistentUUID = '123e4567-e89b-12d3-a456-426614174000';
      await expect(getUserById(validButNonExistentUUID)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getSuperAdmin', () => {
    it('슈퍼어드민을 성공적으로 찾는다', async () => {
      await createTestUser({ username: 'super', role: UserRole.SUPER_ADMIN });
      await createTestUser({ username: 'admin', role: UserRole.ADMIN });

      const superAdmin = await getSuperAdmin();
      expect(superAdmin).toBeDefined();
      expect(superAdmin!.role).toBe(UserRole.SUPER_ADMIN);
      expect(superAdmin!.username).toBe('super');
    });

    it('슈퍼어드민이 없으면 null을 반환한다', async () => {
      await createTestUser({ username: 'admin', role: UserRole.ADMIN });

      const superAdmin = await getSuperAdmin();
      expect(superAdmin).toBeNull();
    });
  });
});
