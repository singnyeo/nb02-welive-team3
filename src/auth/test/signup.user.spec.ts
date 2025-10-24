import { TestAppDataSource } from '../../config/test-data-source';
import { UserRole } from '../../entities/user.entity';
import { ConflictError } from '../../types/error.type';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { signup } from '../auth.service';

describe('AuthService - signup (user)', () => {
  it('새 유저를 정상 생성한다', async () => {
    const apartmentRepo = TestAppDataSource.getRepository('Apartment');
    await apartmentRepo.save({
      name: '테스트아파트',
      address: '서울시 강남구',
      officeNumber: '02-0000-0000',
      description: '테스트용',
      startComplexNumber: '1',
      endComplexNumber: '1',
      startDongNumber: '101',
      endDongNumber: '102',
      startFloorNumber: '1',
      endFloorNumber: '10',
      startHoNumber: '101',
      endHoNumber: '1101',
    });

    const user = await signup({
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

    expect(user.username).toBe('user1');
    expect(user.role).toBe(UserRole.USER);
  });

  it('중복된 username/email/contact로 오류를 던진다', async () => {
    const apartmentRepo = TestAppDataSource.getRepository('Apartment');
    await apartmentRepo.save({
      name: '테스트아파트',
      address: '서울',
      officeNumber: '02-0000-0000',
      description: '테스트',
      startComplexNumber: '1',
      endComplexNumber: '1',
      startDongNumber: '101',
      endDongNumber: '102',
      startFloorNumber: '1',
      endFloorNumber: '10',
      startHoNumber: '101',
      endHoNumber: '1101',
    });

    const body = {
      username: 'dupuser',
      password: '1234',
      contact: '01011112222',
      name: '테스터',
      email: 'dup@example.com',
      apartmentName: '테스트아파트',
      apartmentDong: '101',
      apartmentHo: '101',
      role: UserRole.USER,
    };

    await signup(body);
    await expect(signup(body)).rejects.toThrow(ConflictError);
  });
});
