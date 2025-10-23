import { Request, Response, NextFunction } from "express";
import { handleVoteForOption, handleDeleteVote } from "../votes.controller";
import * as votesService from "../votes.service";
import { BadRequestError, NotFoundError } from "../../types/error.type";

// votes.service를 모킹
jest.mock("../votes.service");

describe("Votes Controller", () => {
  let mockRequest: Partial<Request> & { user?: { id?: string } };
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    // Request 모킹
    mockRequest = {
      params: {},
      user: { id: "user-123" },
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

  describe("handleVoteForOption", () => {
    const validOptionId = "550e8400-e29b-41d4-a716-446655440000";
    const mockVoteResult = {
      message: "투표가 성공적으로 등록되었습니다.",
      updatedOption: {
        id: validOptionId,
        title: "옵션 1",
        votes: 6,
      },
      winnerOption: {
        id: validOptionId,
        title: "옵션 1",
        votes: 6,
      },
      options: [
        { id: validOptionId, title: "옵션 1", votes: 6 },
        { id: "option-2", title: "옵션 2", votes: 3 },
      ],
    };

    it("정상적으로 투표를 처리해야 함", async () => {
      mockRequest.params = { optionId: validOptionId };
      (votesService.voteForOption as jest.Mock).mockResolvedValue(
        mockVoteResult
      );

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(votesService.voteForOption).toHaveBeenCalledWith(
        validOptionId,
        "user-123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockVoteResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { optionId: validOptionId };

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(votesService.voteForOption).not.toHaveBeenCalled();
    });

    it("optionId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = {};

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "옵션 ID가 필요합니다.",
        })
      );
      expect(votesService.voteForOption).not.toHaveBeenCalled();
    });

    it("잘못된 UUID 형식일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = { optionId: "invalid-uuid" };

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 옵션 ID 형식입니다.",
        })
      );
      expect(votesService.voteForOption).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.params = { optionId: validOptionId };
      const serviceError = new NotFoundError("투표 옵션을 찾을 수 없습니다.");
      (votesService.voteForOption as jest.Mock).mockRejectedValue(serviceError);

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("handleDeleteVote", () => {
    const validOptionId = "550e8400-e29b-41d4-a716-446655440000";
    const mockDeleteResult = {
      message: "투표가 성공적으로 취소되었습니다.",
      updatedOption: {
        id: validOptionId,
        title: "옵션 1",
        votes: 4,
      },
    };

    it("정상적으로 투표 취소를 처리해야 함", async () => {
      mockRequest.params = { optionId: validOptionId };
      (votesService.deleteVote as jest.Mock).mockResolvedValue(
        mockDeleteResult
      );

      await handleDeleteVote(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(votesService.deleteVote).toHaveBeenCalledWith(
        validOptionId,
        "user-123"
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockDeleteResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("userId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.user = undefined;
      mockRequest.params = { optionId: validOptionId };

      await handleDeleteVote(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(votesService.deleteVote).not.toHaveBeenCalled();
    });

    it("optionId가 없을 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = {};

      await handleDeleteVote(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "옵션 ID가 필요합니다.",
        })
      );
      expect(votesService.deleteVote).not.toHaveBeenCalled();
    });

    it("잘못된 UUID 형식일 때 BadRequestError를 던져야 함", async () => {
      mockRequest.params = { optionId: "invalid-uuid" };

      await handleDeleteVote(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 옵션 ID 형식입니다.",
        })
      );
      expect(votesService.deleteVote).not.toHaveBeenCalled();
    });

    it("서비스에서 에러가 발생하면 next로 전달해야 함", async () => {
      mockRequest.params = { optionId: validOptionId };
      const serviceError = new NotFoundError("투표 기록을 찾을 수 없습니다.");
      (votesService.deleteVote as jest.Mock).mockRejectedValue(serviceError);

      await handleDeleteVote(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe("UUID 형식 검증 엣지 케이스", () => {
    const validOptionId = "550e8400-e29b-41d4-a716-446655440000";

    it("대문자 UUID도 허용해야 함", async () => {
      const upperCaseUuid = "550E8400-E29B-41D4-A716-446655440000";
      mockRequest.params = { optionId: upperCaseUuid };
      (votesService.voteForOption as jest.Mock).mockResolvedValue({});

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(votesService.voteForOption).toHaveBeenCalled();
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("하이픈이 없는 UUID는 거부해야 함", async () => {
      mockRequest.params = { optionId: "550e8400e29b41d4a716446655440000" };

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 옵션 ID 형식입니다.",
        })
      );
    });

    it("너무 짧은 UUID는 거부해야 함", async () => {
      mockRequest.params = { optionId: "550e8400-e29b-41d4-a716" };

      await handleVoteForOption(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "유효하지 않은 옵션 ID 형식입니다.",
        })
      );
    });
  });
});
