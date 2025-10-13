jest.mock("../../utils/token.util");
jest.mock("../../utils/user.util");
jest.mock("../../middlewares/allow.middleware");

import request from "supertest";
import express from "express";
import { AppDataSource } from "../../config/data-source";
import cookieParser from "cookie-parser";

const mockTokenUtil = require("../../utils/token.util");
const mockUserUtil = require("../../utils/user.util");
const mockAllowMiddleware = require("../../middlewares/allow.middleware");

import { handleCreatePoll } from "../polls.controller";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // 직접 라우트 설정 (router 파일을 거치지 않음)
  app.post("/api/polls", mockAllowMiddleware.allow("ADMIN"), handleCreatePoll);

  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      const status = err.status || 500;
      res.status(status).json({
        message: err.message || "Internal Server Error",
      });
    }
  );

  return app;
};

describe("Polls API E2E Tests", () => {
  let app: express.Application;
  let mockQueryRunner: any;

  beforeAll(() => {
    // Mock 설정
    mockAllowMiddleware.AllowedRole = {
      USER: "USER",
      ADMIN: "ADMIN",
      SUPER_ADMIN: "SUPER_ADMIN",
      NONE: "NONE",
    };

    // allow 미들웨어 mock
    mockAllowMiddleware.allow.mockImplementation((role: string) => {
      return (req: any, res: any, next: any) => {
        const token = req.cookies?.["access-token"];

        if (!token) {
          res.status(401).json({ message: "인증되지 않은 사용자입니다." });
          return;
        }

        // 토큰 파싱 (테스트용)
        if (token === "admin-token") {
          req.user = { id: "admin-123", role: "ADMIN" };
        } else if (token === "user-token") {
          req.user = { id: "user-123", role: "USER" };
        } else {
          res.status(401).json({ message: "유효하지 않은 토큰입니다." });
          return;
        }

        // 권한 체크
        if (role === "ADMIN" && req.user.role !== "ADMIN") {
          res.status(403).json({ message: "관리자 권한이 필요합니다." });
          return;
        }

        next();
      };
    });

    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Mock QueryRunner 설정
    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      manager: {
        save: jest
          .fn()
          .mockImplementation((_entity: any, saveData: any) =>
            Promise.resolve(
              Array.isArray(saveData)
                ? saveData
                : { ...saveData, pollId: "new-poll-123" }
            )
          ),
      },
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    // Mock repository 설정
    jest
      .spyOn(AppDataSource, "getRepository")
      .mockImplementation((entity: any): any => {
        const entityName = typeof entity === "string" ? entity : entity?.name;

        if (entityName === "User") {
          return {
            findOne: jest.fn().mockImplementation((options) => {
              if (options?.where?.id === "admin-123") {
                return Promise.resolve({
                  id: "admin-123",
                  name: "관리자",
                  apartment: {
                    id: "apt-123",
                    pollBoard: { id: "poll-board-123" },
                  },
                });
              }
              return Promise.resolve(null);
            }),
          };
        }
        if (entityName === "Apartment") {
          return {
            findOne: jest.fn().mockResolvedValue({
              id: "apt-123",
              startDongNumber: "101",
              endDongNumber: "105",
            }),
          };
        }
        if (entityName === "Poll") {
          return {
            create: jest.fn().mockImplementation((pollData: any) => ({
              ...pollData,
              pollId: "new-poll-123",
            })),
          };
        }
        if (entityName === "PollOption") {
          return {
            create: jest
              .fn()
              .mockImplementation((optionData: any) => optionData),
          };
        }
        return {};
      });

    jest
      .spyOn(AppDataSource, "createQueryRunner")
      .mockReturnValue(mockQueryRunner);
  });

  describe("POST /api/polls", () => {
    const validPollData = {
      boardId: "board-123",
      status: "PENDING",
      title: "2025년 아파트 외벽 도색 투표",
      content: "아파트 외벽 도색 색상을 결정하는 투표입니다.",
      buildingPermission: 101,
      startDate: "2025-02-01T09:00:00Z",
      endDate: "2025-02-07T18:00:00Z",
      options: [{ title: "베이지색" }, { title: "회색" }, { title: "흰색" }],
    };

    it("관리자가 투표를 성공적으로 생성할 수 있어야 함", async () => {
      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=admin-token`])
        .send(validPollData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "투표가 성공적으로 생성되었습니다"
      );
      expect(response.body).toHaveProperty("pollId");
    });

    it("일반 사용자는 투표를 생성할 수 없어야 함", async () => {
      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=user-token`])
        .send(validPollData);

      expect(response.status).toBe(403);
      expect(response.body).toHaveProperty("message");
    });

    it("인증되지 않은 사용자는 투표를 생성할 수 없어야 함", async () => {
      const response = await request(app)
        .post("/api/polls")
        .send(validPollData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("필수 필드가 누락된 경우 400 에러를 반환해야 함", async () => {
      const invalidData = {
        title: "테스트 투표",
        // content, options 등 필수 필드 누락
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=admin-token`])
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("최소 2개 미만의 옵션일 때 400 에러를 반환해야 함", async () => {
      const invalidData = {
        ...validPollData,
        options: [{ title: "옵션 1" }], // 1개만
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=admin-token`])
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("잘못된 날짜 형식일 때 400 에러를 반환해야 함", async () => {
      const invalidData = {
        ...validPollData,
        startDate: "invalid-date",
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=admin-token`])
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("종료일이 시작일보다 빠를 때 400 에러를 반환해야 함", async () => {
      const invalidData = {
        ...validPollData,
        startDate: "2025-02-07T18:00:00Z",
        endDate: "2025-02-01T09:00:00Z",
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=admin-token`])
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("종료일은 시작일보다");
    });

    it("유효하지 않은 동 번호일 때 400 에러를 반환해야 함", async () => {
      const invalidData = {
        ...validPollData,
        buildingPermission: 200, // 범위 밖
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=admin-token`])
        .send(invalidData);

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("유효하지 않은 동 번호");
    });
  });
});
