import { TestAppDataSource } from '../../config/test-data-source';
import { Apartment } from '../../entities/apartment.entity';
import { User } from '../../entities/user.entity';
import { ApprovalStatus } from '../../entities/approvalStatus.entity';
import { UserRole } from '../../entities/user.entity';
import { Repository } from 'typeorm';

jest.mock('../../config/data-source', () => {
  return {
    AppDataSource: TestAppDataSource,
  };
});

import { getApartments, getApartment } from '../apartments.service';

const apt1Data = {
  name: '서울 아파트',
  address: '서울시 강남구',
  officeNumber: '02-1111-1111',
  description: '서울시 강남구 소재 아파트',
  startComplexNumber: '1',
  endComplexNumber: '1',
  startDongNumber: '101',
  endDongNumber: '105',
  startFloorNumber: '1',
  endFloorNumber: '20',
  startHoNumber: '101',
  endHoNumber: '2005',
  apartmentStatus: ApprovalStatus.APPROVED,
};

const apt2Data = {
  name: '부산 아파트',
  address: '부산시 해운대구',
  officeNumber: '051-222-2222',
  description: '부산시 해운대구 소재 아파트',
  startComplexNumber: '1',
  endComplexNumber: '1',
  startDongNumber: '101',
  endDongNumber: '103',
  startFloorNumber: '1',
  endFloorNumber: '15',
  startHoNumber: '101',
  endHoNumber: '1503',
  apartmentStatus: ApprovalStatus.PENDING,
};

const adminData = {
  username: 'apt_admin_seoul',
  password: '123',
  name: '김관리',
  email: 'admin@seoul.com',
  contact: '01011112222',
  role: UserRole.ADMIN,
  joinStatus: ApprovalStatus.APPROVED,
};

describe('ApartmentsService', () => {
  let aptRepo: Repository<Apartment>;
  let userRepo: Repository<User>;

  beforeEach(() => {
    aptRepo = TestAppDataSource.getRepository(Apartment);
    userRepo = TestAppDataSource.getRepository(User);
  });

  describe('getApartments', () => {
    it('모든 아파트 목록을 관리자 정보와 함께 반환한다', async () => {
      const apt1 = await aptRepo.save(apt1Data);
      const admin1 = await userRepo.save({ ...adminData, apartment: apt1 });
      apt1.adminId = admin1.id;
      await aptRepo.save(apt1);

      await aptRepo.save(apt2Data);

      const result = await getApartments();
      expect(result).toHaveLength(2);

      const formattedApt1 = result.find((a) => a.id === apt1.id);

      expect(formattedApt1).toBeDefined();

      expect(formattedApt1!.name).toBe(apt1.name);
      expect(formattedApt1!.adminId).toBe(admin1.id);
      expect(formattedApt1!.adminName).toBe(admin1.name);

      const formattedApt2 = result.find((a) => a.name === apt2Data.name);
      expect(formattedApt2).toBeDefined();
      expect(formattedApt2!.adminId).toBeNull();
      expect(formattedApt2!.adminName).toBeNull();
    });

    it('이름(name)으로 아파트를 필터링한다', async () => {
      await aptRepo.save(apt1Data);
      await aptRepo.save(apt2Data);

      const result = await getApartments({ name: '서울' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(apt1Data.name);
    });

    it('주소(address)로 아파트를 필터링한다', async () => {
      await aptRepo.save(apt1Data);
      await aptRepo.save(apt2Data);

      const result = await getApartments({ address: '부산' });
      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(apt2Data.name);
    });

    it('아파트가 없으면 빈 배열을 반환한다', async () => {
      const result = await getApartments();
      expect(result).toHaveLength(0);
    });
  });

  describe('getApartment', () => {
    it('특정 아파트 정보를 관리자 정보와 함께 반환한다', async () => {
      const apt1 = await aptRepo.save(apt1Data);
      const admin1 = await userRepo.save({ ...adminData, apartment: apt1 });
      apt1.adminId = admin1.id;
      await aptRepo.save(apt1);

      const result = await getApartment({ id: apt1.id });

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(apt1.id);
      expect(result!.adminId).toBe(admin1.id);
      expect(result!.adminName).toBe(admin1.name);
    });

    it('관리자가 없는 아파트 정보를 반환한다', async () => {
      const apt2 = await aptRepo.save(apt2Data);

      const result = await getApartment({ id: apt2.id });

      expect(result).toBeDefined();
      expect(result).not.toBeNull();
      expect(result!.id).toBe(apt2.id);
      expect(result!.adminId).toBeNull();
      expect(result!.adminName).toBeNull();
    });

    it('아파트를 찾지 못하면 null을 반환한다', async () => {
      const validButNonExistentUUID = '321e4567-e89b-12d3-a456-426614174000';
      const result = await getApartment({ id: validButNonExistentUUID });
      expect(result).toBeNull();
    });
  });
});
