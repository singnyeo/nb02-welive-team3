import request from "supertest";
import express from "express";
import { AppDataSource } from "../../config/data-source";
import pollsRouter from "../polls.router";
import { generateAccessToken } from "../../utils/token.util";
import { UserRole } from "../../entities/user.entity";
import cookieParser from "cookie-parser";

// Test app setup
const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());
  app.use("/api/polls", pollsRouter);

  // Error handler for tests
  app.use(
    (
      err: any,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      res.status(err.status || 500).json({ message: err.message });
    }
  );

  return app;
};

describe("Polls API E2E Tests", () => {
  let app: express.Application;
  let adminToken: string;
  let userToken: string;

  beforeAll(async () => {
    // Initialize database connection if needed
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    app = createTestApp();

    // Generate test tokens
    adminToken = generateAccessToken({
      id: "admin-123",
      role: UserRole.ADMIN,
    });

    userToken = generateAccessToken({
      id: "user-123",
      role: UserRole.USER,
    });
  });

  afterAll(async () => {
    // Close database connection
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
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
      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          if (entity?.name === "User") {
            return {
              findOne: jest.fn().mockResolvedValue({
                id: "admin-123",
                name: "관리자",
                apartment: {
                  id: "apt-123",
                  pollBoard: { id: "poll-board-123" },
                },
              }),
            };
          }
          if (entity?.name === "Apartment") {
            return {
              findOne: jest.fn().mockResolvedValue({
                id: "apt-123",
                startDongNumber: "101",
                endDongNumber: "105",
              }),
            };
          }
          if (entity?.name === "Poll") {
            return {
              create: jest.fn().mockImplementation((pollData: any) => ({
                ...pollData,
                pollId: "new-poll-123",
              })),
            };
          }
          if (entity?.name === "PollOption") {
            return {
              create: jest
                .fn()
                .mockImplementation((optionData: any) => optionData),
            };
          }
          return {};
        });

      jest.spyOn(AppDataSource, "createQueryRunner").mockReturnValue({
        connect: jest.fn(),
        startTransaction: jest.fn(),
        manager: {
          save: jest
            .fn()
            .mockImplementation((_entity: any, saveData: any) =>
              Promise.resolve(saveData)
            ),
        },
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
      } as any);

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=${adminToken}`])
        .send(validPollData)
        .expect(201);

      expect(response.body).toHaveProperty(
        "message",
        "투표가 성공적으로 생성되었습니다"
      );
      expect(response.body).toHaveProperty("pollId");
    });

    it("일반 사용자는 투표를 생성할 수 없어야 함", async () => {
      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=${userToken}`])
        .send(validPollData)
        .expect(403);

      expect(response.body).toHaveProperty("message");
    });

    it("인증되지 않은 사용자는 투표를 생성할 수 없어야 함", async () => {
      const response = await request(app)
        .post("/api/polls")
        .send(validPollData)
        .expect(401);

      expect(response.body).toHaveProperty("message");
    });

    it("필수 필드가 누락된 경우 400 에러를 반환해야 함", async () => {
      const invalidData = {
        title: "테스트 투표",
        // content, options 등 필수 필드 누락
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=${adminToken}`])
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
      expect(response.body.message).toContain("잘못된 요청");
    });

    it("최소 2개 미만의 옵션일 때 400 에러를 반환해야 함", async () => {
      const invalidData = {
        ...validPollData,
        options: [{ title: "옵션 1" }], // 1개만
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=${adminToken}`])
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });

    it("잘못된 날짜 형식일 때 400 에러를 반환해야 함", async () => {
      const invalidData = {
        ...validPollData,
        startDate: "2025-02-01", // ISO 8601 형식이 아님
      };

      const response = await request(app)
        .post("/api/polls")
        .set("Cookie", [`access-token=${adminToken}`])
        .send(invalidData)
        .expect(400);

      expect(response.body).toHaveProperty("message");
    });
  });
});
