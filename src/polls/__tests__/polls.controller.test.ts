import { Request, Response, NextFunction } from "express";
import {
  handleCreatePoll,
  handleGetPolls,
  handleGetPollDetail,
  handleUpdatePoll,
  handleDeletePoll,
} from "../polls.controller";
import * as pollsService from "../polls.service";
import { BadRequestError, NotFoundError } from "../../types/error.type";
import { ZodError } from "zod";
import * as pollQueryDto from "../dto/poll-query-params.dto";
import * as updatePollDto from "../dto/update-poll.dto";

// polls.service를 모킹
jest.mock("../polls.service");

describe("Polls Controller", () => {
  let mockRequest: Partial<Request> & { user?: { id?: string; role?: string } };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Request 모킹
    mockRequest = {
      params: {},
      query: {},
      body: {},
      user: { id: "user-123", role: "USER" },
    } as any;

    // Response 모킹
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    // Next 모킹
    mockNext = jest.fn();

    jest.clearAllMocks();
  });

  describe("handleCreatePoll", () => {
    const validPollData = {
      title: "테스트 투표",
      content: "테스트 내용",
      options: [{ title: "옵션 1" }, { title: "옵션 2" }],
      startDate: "2025-01-01T00:00:00Z",
      endDate: "2025-12-31T23:59:59Z",
    };

    const mockCreatedPoll = {
      pollId: "poll-123",
    };

    it("정상적으로 투표를 생성해야 함", async () => {
      mockRequest.body = validPollData;
      (pollsService.createPoll as jest.Mock).mockResolvedValue(mockCreatedPoll);

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(pollsService.createPoll).toHaveBeenCalledWith(
        "user-123",
        validPollData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "투표가 성공적으로 생성되었습니다",
        pollId: "poll-123",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;
      mockRequest.body = validPollData;

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("title이 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.body = { ...validPollData, title: "" };

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "잘못된 요청: 제목과 내용은 필수입니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("content가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.body = { ...validPollData, content: "" };

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "잘못된 요청: 제목과 내용은 필수입니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("options가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.body = { ...validPollData, options: undefined };

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "잘못된 요청: 투표 옵션이 필요합니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("options가 배열이 아닐 때 BadRequestError를 던져야 함", async () => {
      mockRequest.body = { ...validPollData, options: "not-an-array" };

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "잘못된 요청: 투표 옵션이 필요합니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("options가 2개 미만일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.body = { ...validPollData, options: [{ title: "옵션 1" }] };

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "잘못된 요청: 최소 2개 이상의 옵션이 필요합니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("잘못된 날짜 형식일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.body = {
        ...validPollData,
        startDate: "invalid-date",
      };

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "잘못된 요청: 유효하지 않은 날짜 형식입니다.",
        })
      );
      expect(pollsService.createPoll).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.body = validPollData;
      const serviceError = new BadRequestError("투표 생성 실패");
      (pollsService.createPoll as jest.Mock).mockRejectedValue(serviceError);

      await handleCreatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("handleGetPolls", () => {
    const mockPollsResult = {
      polls: [
        {
          pollId: "poll-1",
          title: "투표 1",
          status: "IN_PROGRESS",
        },
      ],
      totalCount: 1,
    };

    it("정상적으로 투표 목록을 조회해야 함", async () => {
      mockRequest.query = { page: "1", limit: "10" };
      jest
        .spyOn(pollQueryDto, "validatePollQuery")
        .mockReturnValue({ page: 1, limit: 10 });
      (pollsService.getPolls as jest.Mock).mockResolvedValue(mockPollsResult);

      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(pollsService.getPolls).toHaveBeenCalledWith("user-123", "USER", {
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPollsResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;

      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(pollsService.getPolls).not.toHaveBeenCalled();
    });

    it("Zod 검증 실패 시 BadRequestError를 던져야 함", async () => {
      mockRequest.query = { page: "invalid" };
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "number",
          received: "string",
          path: ["page"],
          message: "페이지는 숫자여야 합니다",
        },
      ] as any);
      jest.spyOn(pollQueryDto, "validatePollQuery").mockImplementation(() => {
        throw zodError;
      });

      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("잘못된 요청:"),
        })
      );
      expect(pollsService.getPolls).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.query = { page: "1", limit: "10" };
      jest
        .spyOn(pollQueryDto, "validatePollQuery")
        .mockReturnValue({ page: 1, limit: 10 });
      const serviceError = new Error("Database error");
      (pollsService.getPolls as jest.Mock).mockRejectedValue(serviceError);

      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("handleGetPollDetail", () => {
    const validPollId = "550e8400-e29b-41d4-a716-446655440000";
    const mockPollDetail = {
      pollId: validPollId,
      title: "투표 상세",
      content: "내용",
      status: "IN_PROGRESS",
      options: [],
    };

    it("정상적으로 투표 상세를 조회해야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      (pollsService.getPollDetail as jest.Mock).mockResolvedValue(
        mockPollDetail
      );

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(pollsService.getPollDetail).toHaveBeenCalledWith(
        validPollId,
        "user-123",
        "USER"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockPollDetail);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { pollId: validPollId };

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(pollsService.getPollDetail).not.toHaveBeenCalled();
    });

    it("pollId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = {};

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "투표 ID가 필요합니다.",
        })
      );
      expect(pollsService.getPollDetail).not.toHaveBeenCalled();
    });

    it("잘못된 UUID 형식일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = { pollId: "invalid-uuid" };

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 투표 ID 형식입니다.",
        })
      );
      expect(pollsService.getPollDetail).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      const serviceError = new NotFoundError("투표를 찾을 수 없습니다.");
      (pollsService.getPollDetail as jest.Mock).mockRejectedValue(serviceError);

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("handleUpdatePoll", () => {
    const validPollId = "550e8400-e29b-41d4-a716-446655440000";
    const validUpdateData = {
      title: "수정된 투표 제목",
      content: "수정된 내용",
      buildingPermission: 101,
      startDate: "2025-02-01T09:00:00Z",
      endDate: "2025-12-31T23:59:59Z",
      status: "IN_PROGRESS" as const,
    };

    it("정상적으로 투표를 수정해야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      mockRequest.body = validUpdateData;
      jest
        .spyOn(updatePollDto, "validateUpdatePoll")
        .mockReturnValue(validUpdateData as any);
      (pollsService.updatePoll as jest.Mock).mockResolvedValue(undefined);

      await handleUpdatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(pollsService.updatePoll).toHaveBeenCalledWith(
        validPollId,
        "user-123",
        "USER",
        validUpdateData
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "투표가 성공적으로 수정되었습니다",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { pollId: validPollId };
      mockRequest.body = validUpdateData;

      await handleUpdatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(pollsService.updatePoll).not.toHaveBeenCalled();
    });

    it("pollId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = {};
      mockRequest.body = validUpdateData;

      await handleUpdatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "투표 ID가 필요합니다.",
        })
      );
      expect(pollsService.updatePoll).not.toHaveBeenCalled();
    });

    it("잘못된 UUID 형식일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = { pollId: "invalid-uuid" };
      mockRequest.body = validUpdateData;

      await handleUpdatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 투표 ID 형식입니다.",
        })
      );
      expect(pollsService.updatePoll).not.toHaveBeenCalled();
    });

    it("Zod 검증 실패 시 BadRequestError를 던져야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      mockRequest.body = { invalid: "data" };
      const zodError = new ZodError([
        {
          code: "invalid_type",
          expected: "string",
          received: "undefined",
          path: ["title"],
          message: "제목은 문자열이어야 합니다",
        },
      ] as any);
      jest.spyOn(updatePollDto, "validateUpdatePoll").mockImplementation(() => {
        throw zodError;
      });

      await handleUpdatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: expect.stringContaining("잘못된 요청:"),
        })
      );
      expect(pollsService.updatePoll).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      mockRequest.body = validUpdateData;
      jest
        .spyOn(updatePollDto, "validateUpdatePoll")
        .mockReturnValue(validUpdateData);
      const serviceError = new NotFoundError("투표를 찾을 수 없습니다.");
      (pollsService.updatePoll as jest.Mock).mockRejectedValue(serviceError);

      await handleUpdatePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("handleDeletePoll", () => {
    const validPollId = "550e8400-e29b-41d4-a716-446655440000";

    it("정상적으로 투표를 삭제해야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      (pollsService.deletePoll as jest.Mock).mockResolvedValue(undefined);

      await handleDeletePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(pollsService.deletePoll).toHaveBeenCalledWith(
        validPollId,
        "user-123",
        "USER"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        message: "투표가 성공적으로 삭제되었습니다",
      });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { pollId: validPollId };

      await handleDeletePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(pollsService.deletePoll).not.toHaveBeenCalled();
    });

    it("pollId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = {};

      await handleDeletePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "투표 ID가 필요합니다.",
        })
      );
      expect(pollsService.deletePoll).not.toHaveBeenCalled();
    });

    it("잘못된 UUID 형식일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = { pollId: "invalid-uuid" };

      await handleDeletePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 투표 ID 형식입니다.",
        })
      );
      expect(pollsService.deletePoll).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.params = { pollId: validPollId };
      const serviceError = new NotFoundError("투표를 찾을 수 없습니다.");
      (pollsService.deletePoll as jest.Mock).mockRejectedValue(serviceError);

      await handleDeletePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("UUID 형식 검증 공통 테스트", () => {
    const validPollId = "550e8400-e29b-41d4-a716-446655440000";

    it("대문자 UUID도 허용해야 함 (getPollDetail)", async () => {
      const upperCaseUuid = "550E8400-E29B-41D4-A716-446655440000";
      mockRequest.params = { pollId: upperCaseUuid };
      (pollsService.getPollDetail as jest.Mock).mockResolvedValue({});

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(pollsService.getPollDetail).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("하이픈이 없는 UUID는 거부해야 함", async () => {
      mockRequest.params = { pollId: "550e8400e29b41d4a716446655440000" };

      await handleGetPollDetail(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 투표 ID 형식입니다.",
        })
      );
    });

    it("너무 짧은 UUID는 거부해야 함", async () => {
      mockRequest.params = { pollId: "550e8400-e29b-41d4-a716" };

      await handleDeletePoll(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 투표 ID 형식입니다.",
        })
      );
    });
  });
});
