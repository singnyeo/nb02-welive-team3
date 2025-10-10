import express from "express";
import { allow, AllowedRole } from "../middlewares/allow.middleware";
import { handleCreatePoll, handleGetPolls } from "./polls.controller";

const polls = express.Router();

// 투표 목록 조회 (사용자, 관리자 모두 가능)
polls.get("/", allow(AllowedRole.USER), handleGetPolls);

// 투표 등록 (관리자만 가능)
polls.post("/", allow(AllowedRole.ADMIN), handleCreatePoll);

export default polls;
