jest.mock("../../config/data-source");

import { voteForOption, deleteVote } from "../votes.service";
import { AppDataSource } from "../../config/data-source";
import {
  BadRequestError,
  ForbiddenError,
  NotFoundError,
  ConflictError,
} from "../../types/error.type";

describe("Vote Service", () => {
  let mockUserRepository: any;
  let mockPollRepository: any;
  let mockPollOptionRepository: any;
  let mockVoteRepository: any;
  let mockQueryRunner: any;

  const mockUserId = "user-123";
  const mockOptionId = "option-123";
  const mockPollId = "poll-123";

  const mockUser = {
    id: mockUserId,
    name: "테스트 사용자",
    role: "USER",
    apartment: { id: "apt-123" },
    resident: { dong: "1" }, // buildingPermission 101 % 100 = 1
  };

  const mockPoll = {
    pollId: mockPollId,
    title: "테스트 투표",
    buildingPermission: 101, // 101 % 100 = 1동
    startDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제 시작
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일 종료
    options: [
      { id: "option-123", title: "옵션 1", voteCount: 5 },
      { id: "option-456", title: "옵션 2", voteCount: 3 },
    ],
  };

  const mockOption = {
    id: mockOptionId,
    title: "옵션 1",
    voteCount: 5,
    poll: mockPoll,
    pollId: mockPollId,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      findOne: jest.fn(),
    };
    mockPollRepository = {
      findOne: jest.fn(),
    };
    mockPollOptionRepository = {
      findOne: jest.fn(),
    };
    mockVoteRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      remove: jest.fn(),
    };

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      manager: {
        save: jest
          .fn()
          .mockImplementation((entity, data) => Promise.resolve(data)),
        remove: jest.fn().mockResolvedValue(undefined),
      },
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    (AppDataSource.getRepository as jest.Mock) = jest.fn((entity: string) => {
      switch (entity) {
        case "User":
          return mockUserRepository;
        case "Poll":
          return mockPollRepository;
        case "PollOption":
          return mockPollOptionRepository;
        case "Vote":
          return mockVoteRepository;
        default:
          return {};
      }
    });

    (AppDataSource.createQueryRunner as jest.Mock) = jest.fn(
      () => mockQueryRunner
    );
  });

  describe("voteForOption", () => {
    it("투표를 성공적으로 처리해야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      // 매번 새 객체 생성
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(null); // 이전 투표 없음

      const mockVote = {
        userId: mockUserId,
        pollId: mockPollId,
        optionId: mockOptionId,
      };
      mockVoteRepository.create.mockReturnValue(mockVote);

      const result = await voteForOption(mockOptionId, mockUserId);

      expect(result.message).toBe("투표가 성공적으로 등록되었습니다.");
      expect(result.updatedOption).toEqual({
        id: mockOptionId,
        title: "옵션 1",
        votes: 6, // 5 + 1
      });
      expect(result.winnerOption).toBeDefined();
      expect(result.options).toHaveLength(2);

      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("사용자를 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(voteForOption(mockOptionId, "invalid-user")).rejects.toThrow(
        NotFoundError
      );
    });

    it("옵션을 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPollOptionRepository.findOne.mockResolvedValue(null);

      await expect(voteForOption("invalid-option", mockUserId)).rejects.toThrow(
        NotFoundError
      );
    });

    it("이미 투표한 경우 ConflictError를 던져야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue({ id: "existing-vote" });

      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        ConflictError
      );
    });

    it("투표가 시작되지 않은 경우 BadRequestError를 던져야 함", async () => {
      const futurePoll = {
        ...mockPoll,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일 시작
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption, poll: futurePoll })
      );
      mockPollRepository.findOne.mockResolvedValue(futurePoll);
      mockVoteRepository.findOne.mockResolvedValue(null);

      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        BadRequestError
      );
      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        "투표가 아직 시작되지 않았습니다."
      );
    });

    it("투표가 종료된 경우 BadRequestError를 던져야 함", async () => {
      const expiredPoll = {
        ...mockPoll,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제 종료
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption, poll: expiredPoll })
      );
      mockPollRepository.findOne.mockResolvedValue(expiredPoll);
      mockVoteRepository.findOne.mockResolvedValue(null);

      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        BadRequestError
      );
      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        "투표가 이미 종료되었습니다."
      );
    });

    it("권한이 없는 동 거주자가 투표할 때 ForbiddenError를 던져야 함", async () => {
      const user102Dong = { ...mockUser, resident: { dong: "2" } }; // 2동은 권한 없음 (poll은 1동)

      mockUserRepository.findOne.mockResolvedValue(user102Dong);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(null);

      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        ForbiddenError
      );
      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        "이 투표에 참여할 권한이 없습니다."
      );
    });

    it("관리자는 모든 투표에 참여 가능해야 함", async () => {
      const adminUser = {
        ...mockUser,
        role: "ADMIN",
        resident: { dong: "2" }, // 다른 동이지만 관리자
      };

      mockUserRepository.findOne.mockResolvedValue(adminUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(null);
      mockVoteRepository.create.mockReturnValue({});

      const result = await voteForOption(mockOptionId, mockUserId);

      expect(result.message).toBe("투표가 성공적으로 등록되었습니다.");
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("전체 공개 투표는 모든 사용자가 투표 가능해야 함 (buildingPermission = 0)", async () => {
      const publicPoll = { ...mockPoll, buildingPermission: 0 };
      const anyUser = { ...mockUser, resident: { dong: "105" } };

      mockUserRepository.findOne.mockResolvedValue(anyUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption, poll: publicPoll })
      );
      mockPollRepository.findOne.mockResolvedValue(publicPoll);
      mockVoteRepository.findOne.mockResolvedValue(null);
      mockVoteRepository.create.mockReturnValue({});

      const result = await voteForOption(mockOptionId, mockUserId);

      expect(result.message).toBe("투표가 성공적으로 등록되었습니다.");
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("전체 공개 투표는 모든 사용자가 투표 가능해야 함 (buildingPermission = null)", async () => {
      const publicPoll = { ...mockPoll, buildingPermission: null };
      const anyUser = { ...mockUser, resident: { dong: "105" } };

      mockUserRepository.findOne.mockResolvedValue(anyUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption, poll: publicPoll })
      );
      mockPollRepository.findOne.mockResolvedValue(publicPoll);
      mockVoteRepository.findOne.mockResolvedValue(null);
      mockVoteRepository.create.mockReturnValue({});

      const result = await voteForOption(mockOptionId, mockUserId);

      expect(result.message).toBe("투표가 성공적으로 등록되었습니다.");
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("트랜잭션 실패 시 롤백해야 함", async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(null); // 이전 투표 없음
      mockVoteRepository.create.mockReturnValue({
        userId: mockUserId,
        pollId: mockPollId,
        optionId: mockOptionId,
      });

      // save 메서드가 에러를 던지도록 설정
      mockQueryRunner.manager.save.mockRejectedValueOnce(new Error("DB Error"));

      await expect(voteForOption(mockOptionId, mockUserId)).rejects.toThrow(
        "DB Error"
      );

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });
  });

  describe("deleteVote", () => {
    const mockVote = {
      id: "vote-123",
      userId: mockUserId,
      optionId: mockOptionId,
      pollId: mockPollId,
    };

    it("투표를 성공적으로 취소해야 함", async () => {
      // 매번 새 객체를 생성하도록 mockImplementation 사용
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(mockVote);

      mockQueryRunner.manager.save.mockImplementation(
        (entity: any, data: any) => {
          return Promise.resolve(data);
        }
      );

      const result = await deleteVote(mockOptionId, mockUserId);

      expect(result.message).toBe("투표가 성공적으로 취소되었습니다.");
      expect(result.updatedOption).toEqual({
        id: mockOptionId,
        title: "옵션 1",
        votes: 4, // 5 - 1 (service 코드에서 감소)
      });

      expect(mockQueryRunner.manager.remove).toHaveBeenCalledWith(
        expect.anything(),
        mockVote
      );
      expect(mockQueryRunner.commitTransaction).toHaveBeenCalled();
    });

    it("옵션을 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
      mockPollOptionRepository.findOne.mockResolvedValue(null);

      await expect(deleteVote("invalid-option", mockUserId)).rejects.toThrow(
        NotFoundError
      );
    });

    it("투표 기록을 찾을 수 없을 때 NotFoundError를 던져야 함", async () => {
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(null);

      await expect(deleteVote(mockOptionId, mockUserId)).rejects.toThrow(
        "투표 기록을 찾을 수 없습니다."
      );
    });

    it("시간이 지난 투표는 취소할 수 없어야 함", async () => {
      const expiredPoll = {
        ...mockPoll,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제 종료
      };

      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption, poll: expiredPoll })
      );
      mockPollRepository.findOne.mockResolvedValue(expiredPoll);

      await expect(deleteVote(mockOptionId, mockUserId)).rejects.toThrow(
        "투표가 이미 종료되어 취소할 수 없습니다."
      );
    });

    it("트랜잭션 실패 시 롤백해야 함", async () => {
      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...mockOption })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(mockVote);

      mockQueryRunner.manager.remove.mockRejectedValue(new Error("DB Error"));

      await expect(deleteVote(mockOptionId, mockUserId)).rejects.toThrow();

      expect(mockQueryRunner.rollbackTransaction).toHaveBeenCalled();
      expect(mockQueryRunner.release).toHaveBeenCalled();
    });

    it("투표 수가 0 이하로 내려가지 않아야 함", async () => {
      const optionWithZeroVotes = { ...mockOption, voteCount: 0 };

      mockPollOptionRepository.findOne.mockImplementation(() =>
        Promise.resolve({ ...optionWithZeroVotes })
      );
      mockPollRepository.findOne.mockResolvedValue(mockPoll);
      mockVoteRepository.findOne.mockResolvedValue(mockVote);

      const result = await deleteVote(mockOptionId, mockUserId);

      expect(result.updatedOption).toBeDefined();
      expect(result.updatedOption!.votes).toBe(0);
      expect(mockQueryRunner.manager.save).toHaveBeenCalledWith(
        expect.anything(),
        expect.objectContaining({ voteCount: 0 })
      );
    });
  });
});
