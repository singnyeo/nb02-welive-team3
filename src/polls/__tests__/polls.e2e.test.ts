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

import { handleCreatePoll, handleGetPolls } from "../polls.controller";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // 직접 라우트 설정 (router 파일을 거치지 않음)
  app.get("/api/polls", mockAllowMiddleware.allow("USER"), handleGetPolls);
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
  describe("GET /api/polls", () => {
    let adminToken: string;
    let userToken: string;
    let mockQueryBuilder: any;

    beforeEach(() => {
      // 토큰 생성
      adminToken = "admin-token";
      userToken = "user-token";

      // QueryBuilder Mock 설정
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

      // Repository Mock 설정
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
                    },
                    residences: [],
                  });
                }
                if (options?.where?.id === "user-123") {
                  return Promise.resolve({
                    id: "user-123",
                    name: "일반사용자",
                    apartment: {
                      id: "apt-123",
                    },
                    residences: [{ dong: "101" }, { dong: "102" }],
                  });
                }
                return Promise.resolve(null);
              }),
            };
          }

          if (entityName === "Poll") {
            return {
              createQueryBuilder: jest.fn(() => mockQueryBuilder),
            };
          }

          return {};
        });
    });

    describe("관리자 권한 테스트", () => {
      it("관리자는 모든 투표를 조회할 수 있어야 함", async () => {
        // Given
        const mockPolls = [
          {
            pollId: "poll-1",
            userId: "user-1",
            title: "101동 전용 투표",
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
          {
            pollId: "poll-3",
            userId: "user-3",
            title: "103동 전용 투표",
            writerName: "작성자3",
            buildingPermission: 103,
            createdAt: new Date("2024-01-03"),
            updatedAt: new Date("2024-01-03"),
            startDate: new Date("2024-01-20"),
            endDate: new Date("2024-01-30"),
            status: "CLOSED",
          },
        ];

        mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPolls, 3]);

        // When
        const response = await request(app)
          .get("/api/polls")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(200);

        // Then
        expect(response.body).toHaveProperty("polls");
        expect(response.body).toHaveProperty("totalCount");
        expect(response.body.polls).toHaveLength(3);
        expect(response.body.totalCount).toBe(3);

        // 관리자는 모든 투표를 볼 수 있음
        expect(response.body.polls.map((p: any) => p.title)).toEqual([
          "101동 전용 투표",
          "전체 공개 투표",
          "103동 전용 투표",
        ]);
      });
    });

    describe("일반 사용자 권한 테스트", () => {
      it("일반 사용자는 권한이 있는 투표만 조회할 수 있어야 함", async () => {
        // Given
        const mockPolls = [
          {
            pollId: "poll-1",
            userId: "user-1",
            title: "101동 전용 투표",
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

        mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPolls, 2]);

        // When
        const response = await request(app)
          .get("/api/polls")
          .set("Cookie", [`access-token=${userToken}`])
          .expect(200);

        // Then
        expect(response.body).toHaveProperty("polls");
        expect(response.body).toHaveProperty("totalCount");
        expect(response.body.polls).toHaveLength(2);
        expect(response.body.totalCount).toBe(2);

        // 일반 사용자는 101, 102동 및 전체 공개 투표만 볼 수 있음
        const titles = response.body.polls.map((p: any) => p.title);
        expect(titles).toContain("101동 전용 투표");
        expect(titles).toContain("전체 공개 투표");
      });
    });

    describe("페이지네이션 테스트", () => {
      it("페이지네이션 파라미터가 올바르게 동작해야 함", async () => {
        // Given
        const mockPolls = Array.from({ length: 5 }, (_, i) => ({
          pollId: `poll-${i + 1}`,
          userId: `user-${i + 1}`,
          title: `투표 ${i + 1}`,
          writerName: `작성자${i + 1}`,
          buildingPermission: null,
          createdAt: new Date(`2024-01-${(i + 1).toString().padStart(2, "0")}`),
          updatedAt: new Date(`2024-01-${(i + 1).toString().padStart(2, "0")}`),
          startDate: new Date("2024-01-10"),
          endDate: new Date("2024-01-20"),
          status: "PENDING",
        }));

        mockQueryBuilder.getManyAndCount.mockResolvedValue([mockPolls, 50]);

        // When - 페이지 2, 한 페이지당 5개
        const response = await request(app)
          .get("/api/polls?page=2&limit=5")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(200);

        // Then
        expect(response.body.polls).toHaveLength(5);
        expect(response.body.totalCount).toBe(50);
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(5); // (2-1) * 5
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(5);
      });

      it("기본 페이지네이션 값이 적용되어야 함", async () => {
        // Given
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

        // When - 파라미터 없이 요청
        const response = await request(app)
          .get("/api/polls")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(200);

        // Then
        expect(mockQueryBuilder.skip).toHaveBeenCalledWith(0); // (1-1) * 11
        expect(mockQueryBuilder.take).toHaveBeenCalledWith(11); // 기본값 11
      });

      it("잘못된 페이지 번호일 때 400 에러가 발생해야 함", async () => {
        // When & Then
        const response = await request(app)
          .get("/api/polls?page=0")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(400);

        expect(response.body).toHaveProperty("message");
      });

      it("limit이 100을 초과할 때 400 에러가 발생해야 함", async () => {
        // When & Then
        const response = await request(app)
          .get("/api/polls?limit=101")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(400);

        expect(response.body).toHaveProperty("message");
      });
    });

    describe("인증 테스트", () => {
      it("인증되지 않은 사용자는 401 에러가 발생해야 함", async () => {
        // When & Then
        const response = await request(app).get("/api/polls").expect(401);

        expect(response.body).toHaveProperty("message");
        expect(response.body.message).toContain("인증");
      });

      it("유효하지 않은 토큰일 때 401 에러가 발생해야 함", async () => {
        // When & Then
        const response = await request(app)
          .get("/api/polls")
          .set("Cookie", ["access-token=invalid-token"])
          .expect(401);

        expect(response.body).toHaveProperty("message");
      });
    });

    describe("응답 형식 테스트", () => {
      it("응답이 올바른 형식이어야 함", async () => {
        // Given
        const mockPoll = {
          pollId: "poll-uuid",
          userId: "user-uuid",
          title: "테스트 투표",
          writerName: "테스트 작성자",
          buildingPermission: 101,
          createdAt: new Date("2024-01-01T10:00:00Z"),
          updatedAt: new Date("2024-01-02T10:00:00Z"),
          startDate: new Date("2024-01-10T00:00:00Z"),
          endDate: new Date("2024-01-20T23:59:59Z"),
          status: "PENDING",
        };

        mockQueryBuilder.getManyAndCount.mockResolvedValue([[mockPoll], 1]);

        // When
        const response = await request(app)
          .get("/api/polls")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(200);

        // Then
        expect(response.body).toMatchObject({
          polls: [
            {
              pollId: expect.any(String),
              userId: expect.any(String),
              title: expect.any(String),
              writerName: expect.any(String),
              buildingPermission: expect.any(Number),
              createdAt: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
              ),
              updatedAt: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
              ),
              startDate: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
              ),
              endDate: expect.stringMatching(
                /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/
              ),
              status: expect.stringMatching(/^(PENDING|IN_PROGRESS|CLOSED)$/),
            },
          ],
          totalCount: expect.any(Number),
        });
      });

      it("빈 결과일 때도 올바른 형식이어야 함", async () => {
        // Given
        mockQueryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

        // When
        const response = await request(app)
          .get("/api/polls")
          .set("Cookie", [`access-token=${adminToken}`])
          .expect(200);

        // Then
        expect(response.body).toEqual({
          polls: [],
          totalCount: 0,
        });
      });
    });
  });
});
