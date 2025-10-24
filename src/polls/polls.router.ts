import express from "express";
import { allow, AllowedRole } from "../middlewares/allow.middleware";
import {
  handleCreatePoll,
  handleGetPolls,
  handleGetPollDetail,
  handleUpdatePoll,
  handleDeletePoll,
} from "./polls.controller";

const polls = express.Router();

// 투표 목록 조회 (사용자, 관리자 모두 가능)
polls.get("/", allow(AllowedRole.USER), handleGetPolls);

// 투표 상세 조회 (사용자, 관리자 모두 가능)
polls.get("/:pollId", allow(AllowedRole.USER), handleGetPollDetail);

// 투표 등록 (관리자만 가능)
polls.post("/", allow(AllowedRole.ADMIN), handleCreatePoll);

// 투표 수정 (관리자만 가능)
polls.patch("/:pollId", allow(AllowedRole.ADMIN), handleUpdatePoll);

// 투표 삭제 (관리자만 가능)
polls.delete("/:pollId", allow(AllowedRole.ADMIN), handleDeletePoll);

export default polls;
