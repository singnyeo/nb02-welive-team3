import request from "supertest";
import { Express } from "express";
import { DataSource } from "typeorm";
import { Complaint } from "../../entities/complaint.entity";
import { User } from "../../entities/user.entity";
import app from "../../app";

// 통합 테스트
describe("Complaint Integration Tests", () => {
  let dataSource: DataSource;
  let authToken: string;
  let testUserId: string;
  let adminToken: string;

  beforeAll(async () => {
    dataSource = new DataSource({
      type: "sqlite",
      database: ":memory:",
      entities: [Complaint, User],
      synchronize: true,
      logging: false,
    });
    await dataSource.initialize();

    const userRepo = dataSource.getRepository(User);
    const testUser = userRepo.create({
      email: "test@example.com",
      password: "hashedPassword123",
      name: "테스트 유저",
      role: "USER",
    });
    const savedUser = await userRepo.save(testUser);
    testUserId = savedUser.id;

    authToken = "Bearer mock-user-token-" + testUserId;


    const adminUser = userRepo.create({
      email: "admin@example.com",
      password: "hashedPassword123",
      name: "관리자",
      role: "ADMIN",
    });
    const savedAdmin = await userRepo.save(adminUser);
    adminToken = "Bearer mock-admin-token-" + savedAdmin.id;
  });


  afterAll(async () => {
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  beforeEach(async () => {
    await dataSource.getRepository(Complaint).clear();
  });

  /**
   * POST /complaints - 민원 생성
   */
  describe("POST /complaints", () => {
    it("정상적으로 민원을 등록해야 함", async () => {
      const newComplaint = {
        title: "통합 테스트 민원",
        content: "민원 내용입니다",
        boardId: "board-123",
        isPublic: true,
      };

      const response = await request(app)
        .post("/complaints")
        .set("Authorization", authToken)
        .send(newComplaint);

      expect(response.status).toBe(201);
      expect(response.body.message).toBe("정상적으로 등록 처리되었습니다");

      const complaintRepo = dataSource.getRepository(Complaint);
      const savedComplaint = await complaintRepo.findOne({
        where: { title: newComplaint.title },
      });
      
      expect(savedComplaint).toBeDefined();
      expect(savedComplaint?.userId).toBe(testUserId);
      expect(savedComplaint?.title).toBe(newComplaint.title);
      expect(savedComplaint?.content).toBe(newComplaint.content);
      expect(savedComplaint?.status).toBe("PENDING");
    });

    it("인증되지 않은 사용자는 401을 반환해야 함", async () => {
      const response = await request(app)
        .post("/complaints")
        .send({
          title: "테스트",
          content: "내용",
          boardId: "board-123",
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe("인증이 필요합니다.");

      const count = await dataSource.getRepository(Complaint).count();
      expect(count).toBe(0);
    });

    it("필수 필드가 없으면 400을 반환해야 함", async () => {
      const response = await request(app)
        .post("/complaints")
        .set("Authorization", authToken)
        .send({
          title: "제목만 있음",
        });

      expect(response.status).toBe(400);

      const count = await dataSource.getRepository(Complaint).count();
      expect(count).toBe(0);
    });
  });

  /**
   * GET /complaints - 민원 목록 조회
   */
  describe("GET /complaints", () => {
    beforeEach(async () => {
      const complaintRepo = dataSource.getRepository(Complaint);
      const complaints = [];
      
      for (let i = 1; i <= 15; i++) {
        const complaint = complaintRepo.create({
          userId: testUserId,
          title: `테스트 민원 ${i}`,
          content: `내용 ${i}`,
          boardId: "board-123",
          isPublic: true,
          status: "PENDING",
        });
        complaints.push(complaint);
      }
      
      await complaintRepo.save(complaints);
    });

    it("기본 페이지네이션으로 민원 목록을 조회해야 함", async () => {
      const response = await request(app).get("/complaints");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("complaints");
      expect(response.body).toHaveProperty("totalCount");
      expect(Array.isArray(response.body.complaints)).toBe(true);
      expect(response.body.totalCount).toBe(15);
      expect(response.body.complaints.length).toBeLessThanOrEqual(10); // 기본 limit
    });

    it("쿼리 파라미터로 페이지와 limit을 설정할 수 있어야 함", async () => {
      const response = await request(app)
        .get("/complaints")
        .query({ page: 2, limit: 5 });

      expect(response.status).toBe(200);
      expect(response.body.complaints.length).toBeLessThanOrEqual(5);
      expect(response.body.totalCount).toBe(15);
    });
  });

  /**
   * GET /complaints/:complaintId - 민원 상세 조회
   */
  describe("GET /complaints/:complaintId", () => {
    let testComplaintId: string;

    beforeEach(async () => {
      const complaintRepo = dataSource.getRepository(Complaint);
      const complaint = complaintRepo.create({
        userId: testUserId,
        title: "상세 조회용 민원",
        content: "상세 내용",
        boardId: "board-123",
        isPublic: true,
        status: "PENDING",
      });
      
      const saved = await complaintRepo.save(complaint);
      testComplaintId = saved.complaintId;
    });

    it("민원 상세 정보를 조회해야 함", async () => {
      const response = await request(app).get(
        `/complaints/${testComplaintId}`
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("complaintId", testComplaintId);
      expect(response.body).toHaveProperty("title", "상세 조회용 민원");
      expect(response.body).toHaveProperty("content", "상세 내용");
      expect(response.body).toHaveProperty("status", "PENDING");
    });

    it("민원이 존재하지 않으면 404를 반환해야 함", async () => {
      const response = await request(app).get(
        "/complaints/non-existent-id-12345"
      );

      expect(response.status).toBe(404);
      expect(response.body.message).toBe("해당 민원을 찾을 수 없습니다.");
    });
  });
})
