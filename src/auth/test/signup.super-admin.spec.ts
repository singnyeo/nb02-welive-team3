import { TestAppDataSource } from '../../config/test-data-source';
import { UserRole } from '../../entities/user.entity';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { signupSuperAdmin } from '../auth.service';

describe('AuthService - signupSuperAdmin', () => {
  it('슈퍼관리자를 생성한다', async () => {
    const result = await signupSuperAdmin({
      username: 'super1',
      password: 'superpass',
      contact: '01033334444',
      name: '슈퍼관리자',
      email: 'super@test.com',
      role: UserRole.SUPER_ADMIN,
      joinStatus: ApprovalStatus.APPROVED,
    });

    expect(result.role).toBe(UserRole.SUPER_ADMIN);
    expect(result.joinStatus).toBe(ApprovalStatus.APPROVED);
  });
});
