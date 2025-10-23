import { TestAppDataSource } from '../../config/test-data-source';
import { UserRole } from '../../entities/user.entity';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';
import { NotFoundError } from '../../types/error.type';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { deleteAdmin } from '../auth.service';

describe('AuthService - deleteAdmin', () => {
  it('관리자를 삭제하고 아파트 상태를 초기화한다', async () => {
    const userRepo = TestAppDataSource.getRepository('User');
    const aptRepo = TestAppDataSource.getRepository('Apartment');
    const apt = await aptRepo.save({
      name: '테스트APT',
      address: '서울',
      officeNumber: '02',
      description: 'desc',
      startComplexNumber: '1',
      endComplexNumber: '1',
      startDongNumber: '1',
      endDongNumber: '2',
      startFloorNumber: '1',
      endFloorNumber: '2',
      startHoNumber: '1',
      endHoNumber: '10',
    });
    const admin = await userRepo.save({
      username: 'admin1',
      password: '1234',
      name: '관리자1', // 필수 필드
      contact: '01012345678', // 필수 필드
      email: 'admin1@test.com', // 필수 필드
      role: UserRole.ADMIN,
      joinStatus: ApprovalStatus.APPROVED,
      apartment: apt,
    });
    await deleteAdmin(admin.id);
    const deletedAdmin = await userRepo.findOne({ where: { id: admin.id }, withDeleted: true });
    const deletedApt = await aptRepo.findOne({ where: { id: apt.id }, withDeleted: true });
    expect(deletedAdmin?.deletedAt).not.toBeNull();
    expect(deletedApt?.deletedAt).not.toBeNull();
  });

  it('존재하지 않는 관리자일 경우 NotFoundError 발생', async () => {
    const validButNonExistentUUID = '123e4567-e89b-12d3-a456-426614174000';
    await expect(deleteAdmin(validButNonExistentUUID)).rejects.toThrow(NotFoundError);
  });
});
