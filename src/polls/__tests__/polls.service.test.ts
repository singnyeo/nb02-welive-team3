jest.mock("../../config/data-source");

import { createPoll } from "../polls.service";
import { AppDataSource } from "../../config/data-source";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../../types/error.type";
import { CreatePollDto } from "../dto/create-poll.dto";
import { Poll } from "../../entities/poll.entity";
import { PollOption } from "../../entities/poll-option.entity";

describe("Polls Service", () => {
  let mockUserRepository: any;
  let mockPollRepository: any;
  let mockPollOptionRepository: any;
  let mockApartmentRepository: any;
  let mockQueryRunner: any;

  const validPollData: CreatePollDto = {
    boardId: "board-123",
    status: "PENDING",
    title: "테스트 투표",
    content: "테스트 내용",
    buildingPermission: 101,
    startDate: "2025-02-01T09:00:00Z",
    endDate: "2025-02-07T18:00:00Z",
    options: [{ title: "옵션 1" }, { title: "옵션 2" }],
  };

  const mockUser = {
    id: "user-123",
    name: "관리자",
    apartment: {
      id: "apt-123",
      pollBoard: {
        id: "poll-board-123",
      },
    },
  };

  const mockApartment = {
    id: "apt-123",
    startDongNumber: "101",
    endDongNumber: "105",
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock repository 설정
    mockUserRepository = {
      findOne: jest.fn(),
    };
    mockPollRepository = {
      create: jest.fn(),
    };
    mockPollOptionRepository = {
      create: jest.fn(),
    };
    mockApartmentRepository = {
      findOne: jest.fn(),
    };

    // Mock QueryRunner 설정
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      manager: {
        save: jest.fn(),
      },
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    // AppDataSource mock 설정
    (AppDataSource.getRepository as jest.Mock) = jest.fn((entity: string) => {
      switch (entity) {
        case "User":
          return mockUserRepository;
        case "Poll":
          return mockPollRepository;
        case "PollOption":
          return mockPollOptionRepository;
        case "Apartment":
          return mockApartmentRepository;
        default:
          return {};
      }
    });

    (AppDataSource.createQueryRunner as jest.Mock) = jest.fn(
      () => mockQueryRunner
    );
  });

  describe("createPoll", () => {
    it("투표를 성공적으로 생성해야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApartmentRepository.findOne.mockResolvedValue(mockApartment);

      const mockPoll = {
        pollId: "new-poll-123",
        ...validPollData,
        userId: mockUser.id,
        writerName: mockUser.name,
      };

      mockPollRepository.create.mockReturnValue(mockPoll);
      mockQueryRunner.manager.save.mockResolvedValue(mockPoll);
      mockPollOptionRepository.create.mockImplementation((data: any) => data);

      const result = await createPoll(mockUser.id, validPollData);

      expect(result.pollId).toBe("new-poll-123");
      expect(mockQueryRunner.startTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("사용자를 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(createPoll("invalid-user", validPollData)).rejects.toThrow(
        NotFoundError
      );
    });

    it("아파트 정보가 없을 때 ForbiddenError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: "user-123",
        name: "Test User",
        apartment: null,
      });

      await expect(createPoll("user-123", validPollData)).rejects.toThrow(
        ForbiddenError
      );
    });

    it("투표 게시판이 설정되지 않았을 때 InternalServerError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue({
        id: "user-123",
        name: "Test User",
        apartment: {
          id: "apt-123",
          pollBoard: null,
        },
      });

      await expect(createPoll("user-123", validPollData)).rejects.toThrow(
        InternalServerError
      );
    });

    it("유효하지 않은 동 번호일 때 BadRequestError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApartmentRepository.findOne.mockResolvedValue(mockApartment);

      const invalidData = {
        ...validPollData,
        buildingPermission: 200, // 범위 밖
      };

      await expect(createPoll("user-123", invalidData)).rejects.toThrow(
        BadRequestError
      );
    });

    it("buildingPermission이 undefined일 때 검증을 건너뛰어야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      const mockPoll = {
        pollId: "new-poll-123",
        ...validPollData,
        buildingPermission: undefined,
      };

      mockPollRepository.create.mockReturnValue(mockPoll);
      mockQueryRunner.manager.save.mockResolvedValue(mockPoll);
      mockPollOptionRepository.create.mockImplementation((data: any) => data);

      const dataWithoutPermission = {
        ...validPollData,
        buildingPermission: undefined,
      };

      const result = await createPoll("user-123", dataWithoutPermission);

      expect(result.pollId).toBe("new-poll-123");
      expect(mockApartmentRepository.findOne).not.toHaveBeenCalled();
    });

    it("종료일이 시작일보다 빠를 때 BadRequestError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApartmentRepository.findOne.mockResolvedValue(mockApartment);

      const invalidData = {
        ...validPollData,
        startDate: "2025-02-07T18:00:00Z",
        endDate: "2025-02-01T09:00:00Z",
      };

      await expect(createPoll("user-123", invalidData)).rejects.toThrow(
        "종료일은 시작일보다 늦어야 합니다."
      );
    });

    it("트랜잭션 실패 시 롤백해야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApartmentRepository.findOne.mockResolvedValue(mockApartment);
      mockPollRepository.create.mockReturnValue({});
      mockQueryRunner.manager.save.mockRejectedValue(new Error("DB Error"));

      await expect(createPoll("user-123", validPollData)).rejects.toThrow(
        "투표 생성 중 오류가 발생했습니다."
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("apartment가 조회되지 않을 때도 처리", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockApartmentRepository.findOne.mockResolvedValue(null);

      const mockPoll = {
        pollId: "new-poll-123",
        ...validPollData,
      };

      mockPollRepository.create.mockReturnValue(mockPoll);
      mockQueryRunner.manager.save.mockResolvedValue(mockPoll);
      mockPollOptionRepository.create.mockImplementation((data: any) => data);

      const result = await createPoll("user-123", validPollData);

      expect(result.pollId).toBe("new-poll-123");
      expect(mockApartmentRepository.findOne).toHaveBeenCalled();
    });
  });
});
