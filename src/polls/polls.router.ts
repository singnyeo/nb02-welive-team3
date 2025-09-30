import express from "express";
import { allow, AllowedRole } from "../middlewares/allow.middleware";
import { handleCreatePoll } from "./polls.controller";

const polls = express.Router();

// 투표 등록 (관리자만 가능)
polls.post("/", allow(AllowedRole.ADMIN), handleCreatePoll);

export default polls;
