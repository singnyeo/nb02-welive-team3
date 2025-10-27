import express from "express";
import { handlePing, handleManualRun } from "./poll-scheduler.controller";
import { allow, AllowedRole } from "../middlewares/allow.middleware";

const pollSchedulerRouter = express.Router();

// Poll 스케줄러 상태 확인 (개발용)
pollSchedulerRouter.get("/ping", handlePing);

// 수동으로 스케줄러 실행 (개발/테스트용 - 관리자만)
pollSchedulerRouter.post("/run", allow(AllowedRole.ADMIN), handleManualRun);

export default pollSchedulerRouter;
