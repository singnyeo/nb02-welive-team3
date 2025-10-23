import { TestAppDataSource } from '../../config/test-data-source';
import { UserRole } from '../../entities/user.entity';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';
import { ForbiddenError } from '../../types/error.type';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { cleanup } from '../auth.service';

describe('AuthService - cleanup (Admin)', () => {
  it('슈퍼어드민이 거절된 관리자를 정리한다', async () => {
    const userRepo = TestAppDataSource.getRepository('User');
    const superAdmin = await userRepo.save({
      username: 'super1',
      password: 'superpass',
      contact: '01033334444',
      name: '슈퍼관리자',
      email: 'super@test.com',
      role: UserRole.SUPER_ADMIN,
      joinStatus: ApprovalStatus.APPROVED,
    });
    const admin = await userRepo.save({
      username: 'admin1',
      password: 'adminpass',
      contact: '01022223333',
      name: '관리자',
      email: 'admin@test.com',
      description: '관리자 아파트입니다.',
      startComplexNumber: '1',
      endComplexNumber: '1',
      startDongNumber: '101',
      endDongNumber: '102',
      startFloorNumber: '1',
      endFloorNumber: '10',
      startHoNumber: '101',
      endHoNumber: '1101',
      apartmentName: '관리아파트',
      apartmentAddress: '서울시 송파구',
      apartmentManagementNumber: '02-2222-3333',
      role: UserRole.ADMIN,
      joinStatus: ApprovalStatus.REJECTED,
    });
    await cleanup(superAdmin.id);
    const deleted = await userRepo.findOne({ where: { id: admin.id }, withDeleted: true });
    expect(deleted?.deletedAt).not.toBeNull();
  });

  it('권한 없는 유저가 실행 시 ForbiddenError 발생', async () => {
    const userRepo = TestAppDataSource.getRepository('User');
    const normal = await userRepo.save({
      username: 'user1',
      password: 'pass1234',
      contact: '01011112222',
      name: '홍길동',
      email: 'user1@test.com',
      apartmentName: '테스트아파트',
      apartmentDong: '101',
      apartmentHo: '101',
      role: UserRole.USER,
    });
    await expect(cleanup(normal.id)).rejects.toThrow(ForbiddenError);
  });
});
