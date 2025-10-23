import { TestAppDataSource } from '../../config/test-data-source';
import { hashPassword } from '../../utils/password.util';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';
import { UnauthorizedError, BadRequestError } from '../../types/error.type';
import { UserRole } from '../../entities/user.entity';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { login } from '../auth.service';

describe('AuthService - login', () => {
  it('정상 로그인 성공', async () => {
    const userRepo = TestAppDataSource.getRepository('User');
    const hashed = await hashPassword('mypassword');
    await userRepo.save({
      username: 'user1',
      password: hashed,
      contact: '01012345678',
      name: '홍길동',
      email: 'user1@test.com',
      role: UserRole.USER,
      joinStatus: ApprovalStatus.APPROVED,
    });

    const result = await login({ username: 'user1', password: 'mypassword' });
    expect(result.username).toBe('user1');
  });

  it('비밀번호 불일치 시 UnauthorizedError 발생', async () => {
    const userRepo = TestAppDataSource.getRepository('User');
    const hashed = await hashPassword('correct');
    await userRepo.save({
      username: 'wrongpw',
      password: hashed,
      contact: '01012345678',
      name: '홍길동',
      role: UserRole.USER,
      email: 'user1@test.com',
      joinStatus: ApprovalStatus.APPROVED,
    });

    await expect(login({ username: 'wrongpw', password: 'wrong' })).rejects.toThrow(UnauthorizedError);
  });

  it('존재하지 않는 사용자일 경우 BadRequestError 발생', async () => {
    await expect(login({ username: 'unknown', password: 'pass' })).rejects.toThrow(BadRequestError);
  });
});
