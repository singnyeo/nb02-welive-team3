import { TestAppDataSource } from '../../config/test-data-source';
import { UserRole } from '../../entities/user.entity';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { signupAdmin } from '../auth.service';

describe('AuthService - signupAdmin', () => {
  it('새 관리자를 생성하고 관련 보드를 만든다', async () => {
    const result = await signupAdmin({
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
      apartmentManagementNumber: '0222223333',
      role: UserRole.ADMIN,
    });

    expect(result.username).toBe('admin1');
    expect(result.role).toBe(UserRole.ADMIN);

    const aptRepo = TestAppDataSource.getRepository('Apartment');
    const apt = await aptRepo.findOne({
      where: { name: '관리아파트' },
      relations: { noticeBoard: true, complaintBoard: true, pollBoard: true },
    });
    expect(apt).not.toBeNull();
    expect(apt?.noticeBoard).toBeDefined();
  });
});
