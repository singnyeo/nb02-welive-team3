import request from "supertest";
import express from "express";
import * as service from "../complaint.service";
import { handleCreateComplaint } from "../complaint.controller";

jest.mock("../complaint.service");

const app = express();
app.use(express.json());
app.post("/complaints", handleCreateComplaint);

describe("Complaint 등록 Controller 테스트", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it("POST /complaints - 정상 등록", async () => {
    (service.createComplaintService as jest.Mock).mockResolvedValue({
      complaintId: "123",
    });

    const res = await request(app).post("/complaints").send({
      title: "테스트 민원",
      content: "테스트 내용",
      isPublic: true,
      status: "PENDING",
      boardId: null,
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual({ message: "정상적으로 등록 처리되었습니다" });
    expect(service.createComplaintService).toHaveBeenCalledTimes(1);
    expect(service.createComplaintService).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "테스트 민원",
        content: "테스트 내용",
        isPublic: true,
        status: "PENDING",
        boardId: null,
      })
    );
  });

  it("POST /complaints - 유효하지 않은 요청 (title 누락)", async () => {
    const res = await request(app).post("/complaints").send({
      content: "테스트 내용",
      isPublic: true,
    });

    // Zod에서 title 누락시 자동으로 400 처리
    expect(res.status).toBe(400);
  });
});
