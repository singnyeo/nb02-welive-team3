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
import { getPolls } from "../polls.service";
import { PollQueryParams } from "../dto/poll-query-params.dto";
import { Poll } from "../../entities/poll.entity";
import { PollOption } from "../../entities/poll-option.entity";
import { getPollDetail } from "../polls.service";
import { PollDetailResponseDto } from "../dto/poll-detail-response.dto";

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
  describe("PollService - getPolls", () => {
    let userRepository: any;
    let pollRepository: any;
    let mockQueryBuilder: any;

    beforeEach(() => {
      userRepository = {
        findOne: jest.fn(),
      };

      mockQueryBuilder = {
        createQueryBuilder: jest.fn().mockReturnThis(),
        leftJoinAndSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        take: jest.fn().mockReturnThis(),
        getManyAndCount: jest.fn(),
      };

      pollRepository = {
        createQueryBuilder: jest.fn(() => mockQueryBuilder),
      };

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          if (entity === "User") return userRepository;
          if (entity === "Poll") return pollRepository;
          return {};
        });
    });

    describe("투표 목록 조회", () => {
      const mockUserId = "user-123";
      const mockQueryParams: PollQueryParams = {
        page: 1,
        limit: 11,
      };

      it("관리자가 모든 투표를 조회할 수 있어야 함", async () => {
        // Given
        const mockUser = {
          id: mockUserId,
          apartment: { id: "apt-123" },
          residences: [],
        };

        const mockPolls = [
          {
            pollId: "poll-1",
            userId: "user-1",
            title: "투표 1",
            writerName: "작성자1",
            buildingPermission: 101,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            startDate: new Date("2024-01-10"),
            endDate: new Date("2024-01-20"),
            status: "PENDING",
          },
          {
            pollId: "poll-2",
            userId: "user-2",
            title: "투표 2",
            writerName: "작성자2",
            buildingPermission: null,
            createdAt: new Date("2024-01-02"),
            updatedAt: new Date("2024-01-02"),
            startDate: new Date("2024-01-15"),
            endDate: new Date("2024-01-25"),
            status: "IN_PROGRESS",
          },
        ];

        userRepository.findOne.mockResolvedValue(mockUser);
        mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPolls, 2]);

        // When
        const result = await getPolls(mockUserId, "ADMIN", mockQueryParams);

        // Then
        expect(result.polls).toHaveLength(2);
        expect(result.totalCount).toBe(2);
        expect(result.polls[0].pollId).toBe("poll-1");
        expect(result.polls[1].pollId).toBe("poll-2");

        // 관리자는 andWhere 조건이 추가되지 않음
        expect(mockQueryBuilder.andWhere).not.toHaveBeenCalled();
      });

      it("일반 사용자는 권한이 있는 투표만 조회할 수 있어야 함", async () => {
        // Given
        const mockUser = {
          id: mockUserId,
          apartment: { id: "apt-123" },
          residences: [{ dong: "101" }, { dong: "102" }],
        };

        const mockPolls = [
          {
            pollId: "poll-1",
            userId: "user-1",
            title: "101동 투표",
            writerName: "작성자1",
            buildingPermission: 101,
            createdAt: new Date("2024-01-01"),
            updatedAt: new Date("2024-01-01"),
            startDate: new Date("2024-01-10"),
            endDate: new Date("2024-01-20"),
            status: "PENDING",
          },
          {
            pollId: "poll-2",
            userId: "user-2",
            title: "전체 공개 투표",
            writerName: "작성자2",
            buildingPermission: null,
            createdAt: new Date("2024-01-02"),
            updatedAt: new Date("2024-01-02"),
            startDate: new Date("2024-01-15"),
            endDate: new Date("2024-01-25"),
            status: "IN_PROGRESS",
          },
        ];

        userRepository.findOne.mockResolvedValue(mockUser);
        mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPolls, 2]);

        // When
        const result = await getPolls(mockUserId, "USER", mockQueryParams);

        // Then
        expect(result.polls).toHaveLength(2);
        expect(result.totalCount).toBe(2);

        // 일반 사용자는 권한 필터링 조건이 추가됨
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          "(poll.buildingPermission IS NULL OR poll.buildingPermission IN (:...dongNumbers))",
          { dongNumbers: [101, 102] }
        );
      });

      it("페이지네이션이 올바르게 동작해야 함", async () => {
        // Given
        const mockUser = {
          id: mockUserId,
          apartment: { id: "apt-123" },
          residences: [],
        };

        const queryParamsPage2: PollQueryParams = {
          page: 2,
          limit: 10,
        };

        userRepository.findOne.mockResolvedValue(mockUser);
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 25]);

        // When
        await getPolls(mockUserId, "ADMIN", queryParamsPage2);

        // Then
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(10); // (2-1) * 10
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(10);
      });

      it("거주지 정보가 없는 사용자는 전체 공개 투표만 조회 가능", async () => {
        // Given
        const mockUser = {
          id: mockUserId,
          apartment: { id: "apt-123" },
          residences: [],
        };

        userRepository.findOne.mockResolvedValue(mockUser);
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

        // When
        await getPolls(mockUserId, "USER", mockQueryParams);

        // Then
        expect(mockQueryBuilder.andWhere).toHaveBeenCalledWith(
          "poll.buildingPermission IS NULL"
        );
      });

      it("사용자를 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
        // Given
        userRepository.findOne.mockResolvedValue(null);

        // When & Then
        await expect(
          getPolls(mockUserId, "USER", mockQueryParams)
        ).rejects.toThrow(NotFoundError);

        expect(userRepository.findOne).toHaveBeenCalledWith({
          where: { id: mockUserId },
          relations: {
            apartment: true,
            residences: true,
          },
        });
      });

      it("아파트 정보가 없는 사용자일 때 ForbiddenError를 던져야 함", async () => {
        // Given
        const mockUser = {
          id: mockUserId,
          apartment: null,
          residences: [],
        };

        userRepository.findOne.mockResolvedValue(mockUser);

        // When & Then
        await expect(
          getPolls(mockUserId, "USER", mockQueryParams)
        ).rejects.toThrow(ForbiddenError);
      });

      it("날짜가 ISO 형식으로 변환되어야 함", async () => {
        // Given
        const mockUser = {
          id: mockUserId,
          apartment: { id: "apt-123" },
          residences: [],
        };

        const mockDate = new Date("2024-01-01T10:00:00Z");
        const mockPolls = [
          {
            pollId: "poll-1",
            userId: "user-1",
            title: "테스트 투표",
            writerName: "작성자",
            buildingPermission: null,
            createdAt: mockDate,
            updatedAt: mockDate,
            startDate: mockDate,
            endDate: mockDate,
            status: "PENDING",
          },
        ];

        userRepository.findOne.mockResolvedValue(mockUser);
        mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPolls, 1]);

        // When
        const result = await getPolls(mockUserId, "ADMIN", mockQueryParams);

        // Then
        expect(result.polls[0].createdAt).toBe("2024-01-01T10:00:00.000Z");
        expect(result.polls[0].updatedAt).toBe("2024-01-01T10:00:00.000Z");
        expect(result.polls[0].startDate).toBe("2024-01-01T10:00:00.000Z");
        expect(result.polls[0].endDate).toBe("2024-01-01T10:00:00.000Z");
      });
    });
    describe("PollService - getPollDetail", () => {
      let userRepository: any;
      let pollRepository: any;
      let pollBoardRepository: any;

      const mockPollId = "poll-123";
      const mockUserId = "user-123";

      beforeEach(() => {
        jest.clearAllMocks();

        userRepository = {
          findOne: jest.fn(),
        };

        pollRepository = {
          findOne: jest.fn(),
        };

        pollBoardRepository = {
          findOne: jest.fn(),
        };

        jest
          .spyOn(AppDataSource, "getRepository")
          .mockImplementation((entity: any): any => {
            if (entity === "User") return userRepository;
            if (entity === "Poll") return pollRepository;
            if (entity === "PollBoard") return pollBoardRepository;
            return {};
          });
      });

      describe("투표 상세 조회", () => {
        const mockUser = {
          id: mockUserId,
          apartment: { id: "apt-123" },
          resident: { dong: "101" },
        };

        const mockPoll = {
          pollId: mockPollId,
          userId: "author-123",
          title: "테스트 투표",
          content: "투표 내용입니다.",
          writerName: "작성자",
          buildingPermission: 101,
          boardId: "board-123",
          createdAt: new Date("2024-01-01T10:00:00Z"),
          updatedAt: new Date("2024-01-02T10:00:00Z"),
          startDate: new Date("2024-01-10T00:00:00Z"),
          endDate: new Date("2024-01-20T23:59:59Z"),
          status: "IN_PROGRESS",
          user: { id: "author-123", name: "작성자" },
          options: [
            { id: "opt-1", title: "옵션 1", voteCount: 5 },
            { id: "opt-2", title: "옵션 2", voteCount: 3 },
          ],
        };

        const mockPollBoard = {
          id: "board-123",
          apartment: { id: "apt-123", name: "테스트 아파트" },
        };

        it("투표 상세를 성공적으로 조회해야 함", async () => {
          // Given
          userRepository.findOne.mockResolvedValue(mockUser);
          pollRepository.findOne.mockResolvedValue(mockPoll);
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When
          const result = await getPollDetail(mockPollId, mockUserId, "USER");

          // Then
          expect(result).toMatchObject({
            pollId: mockPollId,
            title: "테스트 투표",
            content: "투표 내용입니다.",
            writerName: "작성자",
            buildingPermission: 101,
            status: "IN_PROGRESS",
            boardName: "주민투표 게시판",
            options: [
              { id: "opt-1", title: "옵션 1", voteCount: 5 },
              { id: "opt-2", title: "옵션 2", voteCount: 3 },
            ],
          });

          expect(result.createdAt).toBe("2024-01-01T10:00:00.000Z");
          expect(result.startDate).toBe("2024-01-10T00:00:00.000Z");
          expect(result.endDate).toBe("2024-01-20T23:59:59.000Z");
        });

        it("관리자는 모든 투표 상세를 조회할 수 있어야 함", async () => {
          // Given
          const adminUser = {
            id: "admin-123",
            apartment: { id: "apt-123" },
            resident: null,
          };

          const restrictedPoll = {
            ...mockPoll,
            buildingPermission: 105, // 다른 동
          };

          userRepository.findOne.mockResolvedValue(adminUser);
          pollRepository.findOne.mockResolvedValue(restrictedPoll);
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When
          const result = await getPollDetail(mockPollId, "admin-123", "ADMIN");

          // Then
          expect(result.pollId).toBe(mockPollId);
          expect(result.buildingPermission).toBe(105);
          // 관리자는 권한 제한 없이 조회 가능
        });

        it("일반 사용자는 권한이 있는 투표만 조회 가능해야 함", async () => {
          // Given
          const user102Dong = {
            id: "user-102",
            apartment: { id: "apt-123" },
            resident: { dong: "102" },
          };

          userRepository.findOne.mockResolvedValue(user102Dong);
          pollRepository.findOne.mockResolvedValue(mockPoll); // 101동 전용 투표
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When & Then
          await expect(
            getPollDetail(mockPollId, "user-102", "USER")
          ).rejects.toThrow(ForbiddenError);
        });

        it("전체 공개 투표는 모든 입주민이 조회 가능해야 함", async () => {
          // Given
          const anyUser = {
            id: "any-user",
            apartment: { id: "apt-123" },
            resident: { dong: "105" },
          };

          const publicPoll = {
            ...mockPoll,
            buildingPermission: null, // 전체 공개
          };

          userRepository.findOne.mockResolvedValue(anyUser);
          pollRepository.findOne.mockResolvedValue(publicPoll);
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When
          const result = await getPollDetail(mockPollId, "any-user", "USER");

          // Then
          expect(result.pollId).toBe(mockPollId);
          expect(result.buildingPermission).toBeNull();
        });

        it("사용자를 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
          // Given
          userRepository.findOne.mockResolvedValue(null);

          // When & Then
          await expect(
            getPollDetail(mockPollId, "invalid-user", "USER")
          ).rejects.toThrow(NotFoundError);
        });

        it("투표를 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
          // Given
          userRepository.findOne.mockResolvedValue(mockUser);
          pollRepository.findOne.mockResolvedValue(null);

          // When & Then
          await expect(
            getPollDetail("invalid-poll", mockUserId, "USER")
          ).rejects.toThrow(NotFoundError);
        });

        it("투표 게시판 정보를 찾을 수 없을 때 InternalServerError를 던져야 함", async () => {
          // Given
          userRepository.findOne.mockResolvedValue(mockUser);
          pollRepository.findOne.mockResolvedValue(mockPoll);
          pollBoardRepository.findOne.mockResolvedValue(null);

          // When & Then
          await expect(
            getPollDetail(mockPollId, mockUserId, "USER")
          ).rejects.toThrow(InternalServerError);
        });

        it("다른 아파트의 투표는 조회할 수 없어야 함", async () => {
          // Given
          const otherAptUser = {
            id: "other-user",
            apartment: { id: "other-apt-123" },
            resident: null,
          };

          userRepository.findOne.mockResolvedValue(otherAptUser);
          pollRepository.findOne.mockResolvedValue(mockPoll);
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When & Then
          await expect(
            getPollDetail(mockPollId, "other-user", "USER")
          ).rejects.toThrow(ForbiddenError);
        });

        it("거주지 정보가 없는 사용자도 전체 공개 투표는 조회 가능해야 함", async () => {
          // Given
          const noResidentUser = {
            id: "no-resident",
            apartment: { id: "apt-123" },
            resident: null,
          };

          const publicPoll = {
            ...mockPoll,
            buildingPermission: null,
          };

          userRepository.findOne.mockResolvedValue(noResidentUser);
          pollRepository.findOne.mockResolvedValue(publicPoll);
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When
          const result = await getPollDetail(mockPollId, "no-resident", "USER");

          // Then
          expect(result.pollId).toBe(mockPollId);
        });

        it("거주지 정보가 없는 사용자는 특정 동 투표를 조회할 수 없어야 함", async () => {
          // Given
          const noResidentUser = {
            id: "no-resident",
            apartment: { id: "apt-123" },
            resident: null,
          };

          userRepository.findOne.mockResolvedValue(noResidentUser);
          pollRepository.findOne.mockResolvedValue(mockPoll); // 101동 전용
          pollBoardRepository.findOne.mockResolvedValue(mockPollBoard);

          // When & Then
          await expect(
            getPollDetail(mockPollId, "no-resident", "USER")
          ).rejects.toThrow(ForbiddenError);
        });
      });
    });
  });
});
