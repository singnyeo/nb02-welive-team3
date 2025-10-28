import {
  createResident,
  createResidentFromUser,
  getResidentList,
  residentListDetail,
  updateResident,
  deleteResident,
  registerResidentsFromCsv,
  residentListCsv
} from '../resident.service';
import { AppDataSource } from '../../config/data-source';
import { HouseholdType, Resident, ResidenceStatus } from '../../entities/resident.entity';
import { ConflictError, NotFoundError } from '../../types/error.type';
import { CreateResidentDto } from '../dtos/create-resident.dto';
import { Apartment } from '../../entities/apartment.entity';
import { User } from '../../entities/user.entity';
import { parseCsvBuffer } from '../utils/resident-csv.util';

jest.mock('../../config/data-source', () => ({
  AppDataSource: {
    getRepository: jest.fn(),
  },
}));

// 입주민 개별 등록 테스트(createResident)
describe('입주민 개별 등록 createResident', () => {
  let mockingRepository: any;

  const apartmentMock = { id: 'apartment-1' } as Apartment;
  const dtoMock: CreateResidentDto = {
    building: '101',
    unitNumber: '1001',
    name: '김길동',
    contact: '010-1234-5678',
    isHouseholder: HouseholdType.HOUSEHOLDER,
  }

  beforeEach(() => {
    mockingRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockingRepository);
  });

  test('입주민 개별 등록 성공', async () => {
    mockingRepository.findOne.mockResolvedValueOnce(null); // 기존 입주민 없음
    mockingRepository.create.mockReturnValueOnce({ ...dtoMock, id: 'resident-1' }); // 새로운 입주민 생성
    mockingRepository.save.mockResolvedValueOnce({ id: 'resident-1' }); // 저장된 입주민 반환

    mockingRepository.findOne.mockResolvedValueOnce({ // 두번째 호출
      id: 'resident-1', // 저장한 입주민 정보 반환
      ...dtoMock,
      user: null,
      isHouseholder: 'HOUSEHOLDER',
      isRegistered: true,
      residenceStatus: 'RESIDENCE',
    });

    const result = await createResident(dtoMock, apartmentMock);

    expect(result.name).toBe('김길동');
    expect(result.building).toBe('101');
    expect(result.unitNumber).toBe('1001');
    expect(result.contact).toBe('010-1234-5678');
    expect(result.isHouseholder).toBe(HouseholdType.HOUSEHOLDER);
    expect(mockingRepository.save).toHaveBeenCalledTimes(1);
  });

  test('이미 등록된 입주민일 경우 ConflictError 발생', async () => {
    mockingRepository.findOne.mockResolvedValueOnce({ id: 'resident-1' });

    await expect(createResident(dtoMock, apartmentMock))
      .rejects
      .toThrow(ConflictError);

    expect(mockingRepository.save).toHaveBeenCalledTimes(0);
  });
});

// 사용자로 부터 입주민 등록 테스트(createResidentFromUser)
describe('사용자로부터 입주민 리소스 생성 createResidentFromUser', () => {
  let residentRepository: any;
  let mockQueryRunner: any;

  const apartmentMock = { id: 'apartment-1' } as Apartment;
  const userMock = {
    id: 'user-1',
    name: '김길동',
    contact: '01012345678',
    email: 'test@example.com',
    joinStatus: 'APPROVED',
  } as User;

  beforeEach(() => {
    residentRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest.fn().mockReturnValue(residentRepository),
      },
    };
    AppDataSource.createQueryRunner = jest.fn().mockReturnValue(mockQueryRunner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('기존 입주민 없으면 새 입주민 생성 후 반환', async () => {
    residentRepository.findOne.mockResolvedValue(null); // 기존 입주민 없음

    const newResident = {
      id: 'resident-1',
      name: userMock.name,
      contact: userMock.contact,
      building: '101',
      unitNumber: '1001',
      isHouseholder: HouseholdType.HOUSEHOLDER,
      residenceStatus: ResidenceStatus.RESIDENCE,
      isRegistered: true,
      user: userMock,
      apartment: apartmentMock,
    };

    residentRepository.create.mockReturnValue(newResident);
    residentRepository.save.mockResolvedValue(newResident);

    const result = await createResidentFromUser(
      userMock,
      '101',
      '1001',
      apartmentMock
    );

    expect(residentRepository.findOne).toHaveBeenCalledWith({
      where: {
        name: userMock.name,
        building: '101',
        unitNumber: '1001',
        apartment: { id: apartmentMock.id },
      },
      relations: ['user'],
    });

    expect(residentRepository.create).toHaveBeenCalledWith({
      name: userMock.name,
      contact: userMock.contact,
      building: '101',
      unitNumber: '1001',
      isHouseholder: HouseholdType.HOUSEHOLDER,
      residenceStatus: ResidenceStatus.RESIDENCE,
      isRegistered: true,
      user: userMock,
      apartment: apartmentMock,
    });

    expect(residentRepository.save).toHaveBeenCalledWith(newResident);

    expect(result).toMatchObject({
      id: 'resident-1',
      userId: userMock.id,
      building: '101',
      unitNumber: '1001',
      contact: userMock.contact,
      email: userMock.email,
      name: userMock.name,
      residenceStatus: ResidenceStatus.RESIDENCE,
      isHouseholder: HouseholdType.HOUSEHOLDER,
      isRegistered: true,
      approvalStatus: userMock.joinStatus,
    });
  });

  test('기존 입주민 있으면 유저 연결 후 업데이트', async () => {
    const existingResident = {
      id: 'resident-2',
      name: userMock.name,
      building: '101',
      unitNumber: '1001',
      contact: '01099999999',
      user: null,
      isHouseholder: HouseholdType.HOUSEHOLDER,
      residenceStatus: ResidenceStatus.RESIDENCE,
      isRegistered: false,
    };

    residentRepository.findOne.mockResolvedValue(existingResident);
    residentRepository.save.mockImplementation(async (resident: Resident) => ({ ...resident, id: 'resident-2' }));

    const result = await createResidentFromUser(
      userMock,
      '101',
      '1001',
      apartmentMock
    );

    expect(residentRepository.findOne).toHaveBeenCalled();

    // 기존 resident에 user 연결하고 isRegistered true로 저장했는지 확인
    expect(residentRepository.save).toHaveBeenCalledWith({
      ...existingResident,
      user: userMock,
      isRegistered: true,
    });

    expect(result).toMatchObject({
      id: 'resident-2',
      userId: userMock.id,
      building: '101',
      unitNumber: '1001',
      contact: '01099999999',
      email: userMock.email,
      name: userMock.name,
      residenceStatus: ResidenceStatus.RESIDENCE,
      isHouseholder: HouseholdType.HOUSEHOLDER,
      isRegistered: true,
      approvalStatus: userMock.joinStatus,
    });
  });
});

// 입주민 목록 조회 getResidentsList
describe('입주민 목록 조회 getResidentList', () => {
  let mockQueryBuilder: any;

  const mockResident = {
    id: 'resident-1',
    building: '101',
    unitNumber: '1001',
    contact: '01012345678',
    name: '김길동',
    isHouseholder: HouseholdType.HOUSEHOLDER,
    isRegistered: true,
    residenceStatus: ResidenceStatus.RESIDENCE,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      joinStatus: 'APPROVED',
    } as User,
  };
  const paramsMock = {
    apartmentId: 'apartment-1',
    name: '김',
    contact: '1234',
    building: '101',
    unitNumber: '1001',
    isRegistered: true,
    residenceStatus: ResidenceStatus.RESIDENCE,
  }

  beforeEach(() => {
    mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      leftJoinAndSelect: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      addOrderBy: jest.fn().mockReturnThis(),
      getMany: jest.fn().mockResolvedValue([mockResident]),
    }

    const mockingRepository = { createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder) };
    (AppDataSource.getRepository as jest.Mock) = jest.fn().mockReturnValue(mockingRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('입주민 목록 조회 - 동적 쿼리 조건에 맞는 입주민 반환', async () => {
    const result = await getResidentList(paramsMock);

    expect(mockQueryBuilder.where).toHaveBeenCalledWith('resident.apartmentId = :apartmentId', { apartmentId: paramsMock.apartmentId });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('resident.building = :building', { building: paramsMock.building });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('resident.unitNumber = :unitNumber', { unitNumber: paramsMock.unitNumber });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('resident.residenceStatus = :residenceStatus', { residenceStatus: paramsMock.residenceStatus });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('resident.isRegistered = :isRegistered', { isRegistered: paramsMock.isRegistered });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('resident.name LIKE :name', { name: `%${paramsMock.name}%` });
    expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith('resident.contact LIKE :contact', { contact: `%${paramsMock.contact}%` });

    expect(result.residents).toEqual([
      {
        id: 'resident-1',
        userId: 'user-1',
        building: '101',
        unitNumber: '1001',
        contact: '01012345678',
        email: 'test@example.com',
        name: '김길동',
        residenceStatus: 'RESIDENCE',
        isHouseholder: 'HOUSEHOLDER',
        isRegistered: true,
        approvalStatus: 'APPROVED',
      }
    ]);
  });
});

// 입주민 상세 조회 residentListDetail 
describe('입주민 상세 조회 getResidentDetail', () => {
  let mockingRepository: any;

  const apartmentIdMock = 'apartment-1';
  const residentIdMock = 'resident-1';

  const residentMock = {
    id: 'resident-1',
    building: '101',
    unitNumber: '1001',
    contact: '01012345678',
    name: '김길동',
    isHouseholder: HouseholdType.HOUSEHOLDER,
    isRegistered: true,
    residenceStatus: ResidenceStatus.RESIDENCE,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      joinStatus: 'APPROVED',
    } as User,
  };

  beforeEach(() => {
    mockingRepository = {
      findOne: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockingRepository);
  });

  test('입주민 목록 상세 조회', async () => {
    mockingRepository.findOne.mockResolvedValue(residentMock);
    const result = await residentListDetail(residentIdMock, apartmentIdMock);

    expect(mockingRepository.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          id: residentIdMock,
          apartment: { id: apartmentIdMock },
        },
        relations: ['user'],
      })
    );

    expect(result).toEqual({
      id: 'resident-1',
      userId: 'user-1',
      building: '101',
      unitNumber: '1001',
      contact: '01012345678',
      email: 'test@example.com',
      name: '김길동',
      residenceStatus: 'RESIDENCE',
      isHouseholder: 'HOUSEHOLDER',
      isRegistered: true,
      approvalStatus: 'APPROVED',
    });
  });

  test('입주민 정보가 없는 경우 예외 처리', async () => {
    mockingRepository.findOne.mockResolvedValue(null);

    await expect(residentListDetail(residentIdMock, apartmentIdMock))
      .rejects
      .toThrow('입주민 정보를 찾을 수 없습니다.');
  });
});

// 입주민 정보 수정 updateResident
describe('입주민 정보 수정 updateResident', () => {
  const apartmentIdMock = 'apartment-1';
  const residentIdMock = 'resident-1';
  let mockingRepository: any;

  const existingResident = {
    id: 'resident-1',
    building: '101',
    unitNumber: '1001',
    contact: '01012345678',
    name: '김길동',
    isHouseholder: HouseholdType.HOUSEHOLDER,
    isRegistered: true,
    residenceStatus: ResidenceStatus.RESIDENCE,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      joinStatus: 'APPROVED',
    } as User,
  };

  beforeEach(() => {
    mockingRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockingRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('기존 입주민 정보가 존재하면, 업데이트 후 반환', async () => {

    const updateData = {
      contact: '01099998888',
      name: '홍길동',
    }

    const updatedResident = {
      ...existingResident,
      ...updateData,
    };
    mockingRepository.findOne.mockResolvedValue(existingResident);
    mockingRepository.save.mockResolvedValue(updatedResident);

    const result = await updateResident(residentIdMock, apartmentIdMock, updateData);

    expect(result).toEqual({
      id: 'resident-1',
      userId: 'user-1',
      building: '101',
      unitNumber: '1001',
      contact: '01099998888',
      email: 'test@example.com',
      name: '홍길동',
      residenceStatus: 'RESIDENCE',
      isHouseholder: 'HOUSEHOLDER',
      isRegistered: true,
      approvalStatus: 'APPROVED',
    });
  })
});

// 입주민 삭제 deleteResident
describe('입주민 소프트 삭제 deleteResident', () => {
  const residentIdMock = 'resident -1';
  const apartmentIdMock = 'apartment-1';

  const existingResident = {
    id: residentIdMock,
    building: '101',
    unitNumber: '1001',
    contact: '01012345678',
    name: '김길동',
    isHouseholder: HouseholdType.HOUSEHOLDER,
    isRegistered: true,
    residenceStatus: ResidenceStatus.RESIDENCE,
    user: {
      id: 'user-1',
      email: 'test@example.com',
      joinStatus: 'APPROVED',
    } as User,
  } as Resident;

  let residentRepository: any;
  let userRepository: any;
  let mockQueryRunner: any;


  beforeEach(() => {
    residentRepository = {
      findOne: jest.fn(),
      softRemove: jest.fn()
    };
    userRepository = {
      softRemove: jest.fn(),
    }
    mockQueryRunner = {
      connect: jest.fn(),
      startTransaction: jest.fn(),
      commitTransaction: jest.fn(),
      rollbackTransaction: jest.fn(),
      release: jest.fn(),
      manager: {
        getRepository: jest
          .fn()
          .mockImplementation((entity) => {
            if (entity === Resident) return residentRepository;
            if (entity === User) return userRepository;
          }),
      },
    },
      (AppDataSource.createQueryRunner as jest.Mock).mockReturnValue(mockQueryRunner);
  });

  afterEach(() => {
    jest.clearAllMocks();
  })

  test('입주민과 유저가 존재하면 softremove', async () => {
    residentRepository.findOne.mockResolvedValueOnce(existingResident)

    await deleteResident(residentIdMock, apartmentIdMock);

    expect(mockQueryRunner.connect).toHaveBeenCalled();
    expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
    expect(residentRepository.findOne).toHaveBeenLastCalledWith({
      where: {
        id: residentIdMock,
        apartment: { id: apartmentIdMock },
      },
      relations: ['user'],
    });

    expect(userRepository.softRemove).toHaveBeenCalledWith(existingResident.user);
    expect(residentRepository.softRemove).toHaveBeenLastCalledWith(existingResident);

    expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  test('입주민이 존재하지 않으면 NotFoundError 발생', async () => {
    residentRepository.findOne.mockImplementation(null);

    await expect(deleteResident(residentIdMock, apartmentIdMock)).rejects.toThrow(NotFoundError);

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });

  test('입주민 삭제 중 예외 발생 시 롤백', async () => {
    residentRepository.findOne.mockResolvedValueOnce(existingResident);
    userRepository.softRemove.mockRejectedValue(new Error('db 오류'));

    await expect(deleteResident(residentIdMock, apartmentIdMock)).rejects.toThrow('db 오류');

    expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
    expect(mockQueryRunner.release).toHaveBeenCalled();
  });
});

// 입주민 명부 csv 파일 업로드

jest.mock('../utils/resident-csv.util', () => ({
  parseCsvBuffer: jest.fn(),
}));


describe('입주민 명부 csv 파일 업로드', () => {
  let mockingRepository: any;
  const apartmentMock = { id: 'apartment-1' } as Apartment;

  beforeEach(() => {
    mockingRepository = {
      find: jest.fn(),
      createQueryBuilder: jest.fn(),
    };
    AppDataSource.getRepository = jest.fn().mockReturnValue(mockingRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('csv 데이터가 모두 유효하고 중복 없는 경우, DB에 저장 후 삽입 건수 반환', async () => {
    (parseCsvBuffer as jest.Mock).mockResolvedValue([
      {
        building: '101',
        unitNumber: '1001',
        name: '홍길동',
        contact: '01011112222',
        isHouseholder: 'HOUSEHOLDER',
      },
      {
        building: '105',
        unitNumber: '1005',
        name: '길동이',
        contact: '01033334444',
        isHouseholder: 'HOUSEHOLDER',
      },
    ]);
    mockingRepository.find.mockResolvedValue([]);

    const executeMock = jest.fn().mockResolvedValue({});
    const valuesMock = jest.fn().mockReturnValue({ execute: executeMock });
    const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
    const createQueryBuilderMock = jest.fn().mockReturnValue({ insert: insertMock });

    mockingRepository.createQueryBuilder.mockImplementation(createQueryBuilderMock);

    const result = await registerResidentsFromCsv(Buffer.from(''), apartmentMock);

    expect(parseCsvBuffer).toHaveBeenCalled();
    expect(mockingRepository.find).toHaveBeenCalledWith({
      where: [
        { building: '101', unitNumber: '1001', name: '홍길동', apartment: { id: apartmentMock.id } },
        { building: '105', unitNumber: '1005', name: '길동이', apartment: { id: apartmentMock.id } },
      ],
    });
    expect(createQueryBuilderMock).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    expect(executeMock).toHaveBeenCalled();

    expect(result.count).toBe(2);
  });

  test('CSV 데이터에 유효하지 않은 행이 있으면 ConflictError 발생', async () => {
    // parseCsvBuffer가 유효하지 않은 데이터 포함
    (parseCsvBuffer as jest.Mock).mockResolvedValue([
      {
        building: '101',
        unitNumber: '',
        name: '홍길동',
        contact: '01011112222',
        isHouseholder: 'HOUSEHOLDER',
      },
      {
        building: '105',
        unitNumber: '1005',
        name: '길동이',
        contact: '01033334444',
        isHouseholder: 'HOUSEHOLDER',
      },
    ]);

    await expect(registerResidentsFromCsv(Buffer.from(''), apartmentMock))
      .rejects.toThrow(ConflictError);

    expect(parseCsvBuffer).toHaveBeenCalled();
    expect(mockingRepository.find).not.toHaveBeenCalled();
  });

  test('CSV 데이터 중 기존 DB에 중복 입주민이 있으면 중복 제외하고 저장', async () => {
    (parseCsvBuffer as jest.Mock).mockResolvedValue([
      {
        building: '101',
        unitNumber: '1001',
        name: '홍길',
        contact: '01011112222',
        isHouseholder: 'HOUSEHOLDER',
      },
      {
        building: '105',
        unitNumber: '1005',
        name: '길동이',
        contact: '01033334444',
        isHouseholder: 'HOUSEHOLDER',
      },
    ]);

    mockingRepository.find.mockResolvedValue([
      {
        building: '105',
        unitNumber: '1005',
        name: '길동이',
        contact: '01033334444',
        isHouseholder: 'HOUSEHOLDER',
      },
    ]);

    const executeMock = jest.fn().mockResolvedValue({});
    const valuesMock = jest.fn().mockReturnValue({ execute: executeMock });
    const insertMock = jest.fn().mockReturnValue({ values: valuesMock });
    mockingRepository.createQueryBuilder.mockReturnValue({
      insert: insertMock,
    });

    const result = await registerResidentsFromCsv(Buffer.from(''), apartmentMock);

    expect(result.count).toBe(1);

    expect(mockingRepository.find).toHaveBeenCalled();
    expect(mockingRepository.createQueryBuilder).toHaveBeenCalled();
    expect(insertMock).toHaveBeenCalled();
    expect(executeMock).toHaveBeenCalled();
  });

  test('삽입할 데이터가 없으면 DB insert 호출 안 함', async () => {
    (parseCsvBuffer as jest.Mock).mockResolvedValue([
      {
        building: '105',
        unitNumber: '1005',
        name: '길동이',
        contact: '01033334444',
        isHouseholder: 'HOUSEHOLDER',
      },
    ]);

    // 모두 중복
    mockingRepository.find.mockResolvedValue([
      {
        building: '105',
        unitNumber: '1005',
        name: '길동이',
        contact: '01033334444',
        isHouseholder: 'HOUSEHOLDER',
      },
    ]);

    const insertMock = jest.fn();
    mockingRepository.createQueryBuilder.mockReturnValue({
      insert: insertMock,
      values: jest.fn().mockReturnThis(),
      execute: jest.fn(),
    });

    await expect(registerResidentsFromCsv(Buffer.from(''), apartmentMock))
      .rejects
      .toThrow('이미 등록된 입주민입니다.')

    expect(mockingRepository.find).toHaveBeenCalled();
    expect(insertMock).not.toHaveBeenCalled();
  });
});


/**
 * 입주민 목록 파일 다운로드
 */
describe('입주민 목록 파일 다운로드 residentListCsv', () => {
  const mockFind = jest.fn();

  beforeEach(() => {
    (AppDataSource.getRepository as jest.Mock).mockReturnValue({
      find: mockFind,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('입주민 목록 파일 다운로드', async () => {
    mockFind.mockResolvedValue([
      {
        building: '101',
        unitNumber: '1001',
        name: '홍길동',
        contact: '01012345678',
        isHouseholder: true,
      },
      {
        building: '102',
        unitNumber: '1002',
        name: '김철수',
        contact: null,
        isHouseholder: false,
      },
    ]);

    const result = await residentListCsv('apartment-1');

    expect(result).toContain('"동","호수","이름","연락처","세대주 여부"');
    expect(result).toContain('"101","1001","홍길동","=""01012345678""","HOUSEHOLDER"');
    expect(result).toContain('"102","1002","김철수","","MEMBER"');
  });
});