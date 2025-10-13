import { Request, Response, NextFunction } from "express";
import { handleGetPolls } from "../polls.controller";
import * as pollsService from "../polls.service";
import { BadRequestError } from "../../types/error.type";

jest.mock("../polls.service");

describe("PollController", () => {
  interface MockUser {
    id: string;
    role: string;
  }
  interface MockRequest extends Partial<Request> {
    user?: MockUser;
  }
  let mockRequest: MockRequest;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {
      query: {},
      user: { id: "user-123", role: "USER" },
    } as any;

    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe("handleGetPolls", () => {
    it("정상적으로 투표 목록을 조회해야 함", async () => {
      // Given
      const mockResult = {
        polls: [
          {
            pollId: "poll-1",
            userId: "user-1",
            title: "테스트 투표",
            writerName: "작성자",
            buildingPermission: undefined, // or use a number like 0
            createdAt: "2024-01-01T00:00:00.000Z",
            updatedAt: "2024-01-01T00:00:00.000Z",
            startDate: "2024-01-10T00:00:00.000Z",
            endDate: "2024-01-20T00:00:00.000Z",
            status: "PENDING" as const,
          },
        ],
        totalCount: 1,
      };

      mockRequest.query = { page: "1", limit: "10" };
      jest.spyOn(pollsService, "getPolls").mockResolvedValue(mockResult);

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(pollsService.getPolls).toHaveBeenCalledWith("user-123", "USER", {
        page: 1,
        limit: 10,
      });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockResult);
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("페이지네이션 기본값이 적용되어야 함", async () => {
      // Given
      const mockResult = { polls: [], totalCount: 0 };
      mockRequest.query = {}; // 빈 쿼리
      jest.spyOn(pollsService, "getPolls").mockResolvedValue(mockResult);

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(pollsService.getPolls).toHaveBeenCalledWith(
        "user-123",
        "USER",
        { page: 1, limit: 11 } // 기본값
      );
    });

    it("관리자 권한으로 조회 시 role이 전달되어야 함", async () => {
      // Given
      mockRequest.user = { id: "admin-123", role: "ADMIN" } as any;
      const mockResult = { polls: [], totalCount: 0 };
      jest.spyOn(pollsService, "getPolls").mockResolvedValue(mockResult);

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(pollsService.getPolls).toHaveBeenCalledWith(
        "admin-123",
        "ADMIN",
        expect.any(Object)
      );
    });

    it("사용자 정보가 없을 때 BadRequestError를 던져야 함", async () => {
      // Given
      mockRequest.user = undefined;

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(mockNext).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "사용자 정보를 찾을 수 없습니다.",
        })
      );
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("잘못된 페이지 번호일 때 에러를 처리해야 함", async () => {
      // Given
      mockRequest.query = { page: "0", limit: "10" };

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("limit이 100을 초과할 때 에러를 처리해야 함", async () => {
      // Given
      mockRequest.query = { page: "1", limit: "101" };

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("문자열 쿼리 파라미터를 숫자로 변환해야 함", async () => {
      // Given
      mockRequest.query = { page: "2", limit: "5" };
      const mockResult = { polls: [], totalCount: 0 };
      jest.spyOn(pollsService, "getPolls").mockResolvedValue(mockResult);

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(pollsService.getPolls).toHaveBeenCalledWith(
        "user-123",
        "USER",
        { page: 2, limit: 5 } // 숫자로 변환됨
      );
    });

    it("서비스 에러가 발생하면 next로 전달해야 함", async () => {
      // Given
      const serviceError = new Error("서비스 에러");
      jest.spyOn(pollsService, "getPolls").mockRejectedValue(serviceError);

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(mockNext).toHaveBeenCalledWith(serviceError);
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("잘못된 쿼리 파라미터 타입일 때 에러를 처리해야 함", async () => {
      // Given
      mockRequest.query = { page: "abc", limit: "10" };

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
    });

    it("음수 limit일 때 에러를 처리해야 함", async () => {
      // Given
      mockRequest.query = { page: "1", limit: "-5" };

      // When
      await handleGetPolls(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      // Then
      expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });
});
