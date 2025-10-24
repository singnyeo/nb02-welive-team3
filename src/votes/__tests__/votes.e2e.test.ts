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

import { handleVoteForOption, handleDeleteVote } from "../votes.controller";

const createTestApp = () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  // 직접 라우트 설정
  app.post(
    "/api/options/:optionId/vote",
    mockAllowMiddleware.allow("USER"),
    handleVoteForOption
  );
  app.delete(
    "/api/options/:optionId/vote",
    mockAllowMiddleware.allow("USER"),
    handleDeleteVote
  );

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

describe("Votes API E2E Tests", () => {
  let app: express.Application;
  let mockQueryRunner: any;

  beforeAll(() => {
    mockAllowMiddleware.AllowedRole = {
      USER: "USER",
      ADMIN: "ADMIN",
      SUPER_ADMIN: "SUPER_ADMIN",
      NONE: "NONE",
    };

    mockAllowMiddleware.allow.mockImplementation((role: string) => {
      return (req: any, res: any, next: any) => {
        const token = req.cookies?.["access-token"];

        if (!token) {
          res.status(401).json({ message: "인증되지 않은 사용자입니다." });
          return;
        }

        if (token === "admin-token") {
          req.user = { id: "admin-123", role: "ADMIN" };
        } else if (token === "user-token") {
          req.user = { id: "user-123", role: "USER" };
        } else if (token === "user2-token") {
          req.user = { id: "user-456", role: "USER" };
        } else {
          res.status(401).json({ message: "유효하지 않은 토큰입니다." });
          return;
        }

        next();
      };
    });

    app = createTestApp();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockQueryRunner = {
      connect: jest.fn().mockResolvedValue(undefined),
      startTransaction: jest.fn().mockResolvedValue(undefined),
      manager: {
        save: jest
          .fn()
          .mockImplementation((_entity: any, saveData: any) =>
            Promise.resolve(saveData)
          ),
        remove: jest.fn().mockResolvedValue(undefined),
      },
      commitTransaction: jest.fn().mockResolvedValue(undefined),
      rollbackTransaction: jest.fn().mockResolvedValue(undefined),
      release: jest.fn().mockResolvedValue(undefined),
    };

    jest
      .spyOn(AppDataSource, "createQueryRunner")
      .mockReturnValue(mockQueryRunner);
  });

  describe("POST /api/options/:optionId/vote", () => {
    const mockOptionId = "123e4567-e89b-12d3-a456-426614174000";
    const mockPollId = "223e4567-e89b-12d3-a456-426614174111";
    const mockUserId = "user-123";

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
        { id: mockOptionId, title: "옵션 1", voteCount: 5 },
        {
          id: "323e4567-e89b-12d3-a456-426614174222",
          title: "옵션 2",
          voteCount: 3,
        },
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
      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockImplementation((options) => {
                if (options?.where?.id === mockUserId) {
                  return Promise.resolve(mockUser);
                }
                return Promise.resolve(null);
              }),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockImplementation((options) => {
                if (options?.where?.id === mockOptionId) {
                  return Promise.resolve(mockOption);
                }
                return Promise.resolve(null);
              }),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(mockPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(null), // 기본적으로 투표 없음
              create: jest.fn().mockImplementation((data: any) => data),
            };
          }
          return {};
        });
    });

    it("사용자가 투표를 성공적으로 할 수 있어야 함", async () => {
      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "투표가 성공적으로 등록되었습니다."
      );
      expect(response.body).toHaveProperty("updatedOption");
      expect(response.body.updatedOption).toMatchObject({
        id: mockOptionId,
        title: "옵션 1",
        votes: 6,
      });
      expect(response.body).toHaveProperty("winnerOption");
      expect(response.body).toHaveProperty("options");
      expect(response.body.options).toHaveLength(2);
    });

    it("이미 투표한 사용자는 409 에러가 발생해야 함", async () => {
      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockResolvedValue(mockUser),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue(mockOption),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(mockPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue({ id: "existing-vote" }), // 이미 투표함
              create: jest.fn(),
            };
          }
          return {};
        });

      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(409);

      expect(response.body.message).toContain("이미 투표하셨습니다");
    });

    it("아직 시작되지 않은 투표에는 투표할 수 없어야 함", async () => {
      const futurePoll = {
        ...mockPoll,
        startDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일 시작
      };

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockResolvedValue(mockUser),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue({
                ...mockOption,
                poll: futurePoll,
              }),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(futurePoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
            };
          }
          return {};
        });

      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(400);

      expect(response.body.message).toContain("아직 시작되지 않았습니다");
    });

    it("종료된 투표에는 투표할 수 없어야 함", async () => {
      const expiredPoll = {
        ...mockPoll,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제 종료
      };

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockResolvedValue(mockUser),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue({
                ...mockOption,
                poll: expiredPoll,
              }),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(expiredPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
            };
          }
          return {};
        });

      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(400);

      expect(response.body.message).toContain("이미 종료되었습니다");
    });

    it("권한이 없는 동 거주자는 403 에러가 발생해야 함", async () => {
      const user102Dong = { ...mockUser, resident: { dong: "2" } }; // 2동은 권한 없음

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockResolvedValue(user102Dong),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue(mockOption),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(mockPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn(),
            };
          }
          return {};
        });

      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(403);

      expect(response.body.message).toContain("권한이 없습니다");
    });

    it("관리자는 모든 투표에 참여할 수 있어야 함", async () => {
      const adminUser = {
        ...mockUser,
        id: "admin-123",
        role: "ADMIN",
        resident: { dong: "2" }, // 다른 동
      };

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockResolvedValue(adminUser),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue(mockOption),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(mockPoll), // buildingPermission: 101
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(null),
              create: jest.fn().mockImplementation((data: any) => data),
            };
          }
          return {};
        });

      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=admin-token`])
        .expect(200);

      expect(response.body.message).toBe("투표가 성공적으로 등록되었습니다.");
    });

    it("존재하지 않는 옵션 ID는 404 에러가 발생해야 함", async () => {
      // 유효한 UUID 형식이지만 존재하지 않는 ID 사용
      const nonExistentValidUuid = "999e9999-e99b-99d9-a999-999999999999";

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "User") {
            return {
              findOne: jest.fn().mockResolvedValue(mockUser),
            };
          }
          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue(null), // 옵션 없음
            };
          }
          return {};
        });

      const response = await request(app)
        .post(`/api/options/${nonExistentValidUuid}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(404);

      expect(response.body.message).toContain("찾을 수 없습니다");
    });

    it("잘못된 UUID 형식은 400 에러가 발생해야 함", async () => {
      const response = await request(app)
        .post("/api/options/not-a-uuid/vote")
        .set("Cookie", [`access-token=user-token`])
        .expect(400);

      expect(response.body.message).toContain("유효하지 않은");
    });

    it("인증되지 않은 사용자는 401 에러가 발생해야 함", async () => {
      const response = await request(app)
        .post(`/api/options/${mockOptionId}/vote`)
        .expect(401);

      expect(response.body.message).toContain("인증");
    });
  });

  describe("DELETE /api/options/:optionId/vote", () => {
    const mockOptionId = "123e4567-e89b-12d3-a456-426614174000";
    const mockPollId = "223e4567-e89b-12d3-a456-426614174111";
    const mockUserId = "user-123";

    const mockPoll = {
      pollId: mockPollId,
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // 내일 종료
    };

    const mockOption = {
      id: mockOptionId,
      title: "옵션 1",
      voteCount: 5,
      poll: mockPoll,
    };

    const mockVote = {
      id: "vote-123",
      userId: mockUserId,
      optionId: mockOptionId,
      pollId: mockPollId,
    };

    beforeEach(() => {
      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue(mockOption),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(mockPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(mockVote),
            };
          }
          return {};
        });
    });

    it("사용자가 투표를 성공적으로 취소할 수 있어야 함", async () => {
      const response = await request(app)
        .delete(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`]);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "투표가 성공적으로 취소되었습니다."
      );
      expect(response.body).toHaveProperty("updatedOption");
      expect(response.body.updatedOption).toMatchObject({
        id: mockOptionId,
        title: "옵션 1",
        votes: 4,
      });
    });

    it("투표 기록이 없으면 404 에러가 발생해야 함", async () => {
      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue(mockOption),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(mockPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(null), // 투표 기록 없음
            };
          }
          return {};
        });

      const response = await request(app)
        .delete(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(404);

      expect(response.body.message).toContain("투표 기록을 찾을 수 없습니다");
    });

    it("종료된 투표는 취소할 수 없어야 함", async () => {
      const expiredPoll = {
        ...mockPoll,
        endDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // 어제 종료
      };

      jest
        .spyOn(AppDataSource, "getRepository")
        .mockImplementation((entity: any): any => {
          const entityName = typeof entity === "string" ? entity : entity?.name;

          if (entityName === "PollOption") {
            return {
              findOne: jest.fn().mockResolvedValue({
                ...mockOption,
                poll: expiredPoll,
              }),
            };
          }
          if (entityName === "Poll") {
            return {
              findOne: jest.fn().mockResolvedValue(expiredPoll),
            };
          }
          if (entityName === "Vote") {
            return {
              findOne: jest.fn().mockResolvedValue(mockVote),
            };
          }
          return {};
        });

      const response = await request(app)
        .delete(`/api/options/${mockOptionId}/vote`)
        .set("Cookie", [`access-token=user-token`])
        .expect(400);

      expect(response.body.message).toContain("취소할 수 없습니다");
    });

    it("인증되지 않은 사용자는 401 에러가 발생해야 함", async () => {
      const response = await request(app)
        .delete(`/api/options/${mockOptionId}/vote`)
        .expect(401);

      expect(response.body.message).toContain("인증");
    });
  });
});
