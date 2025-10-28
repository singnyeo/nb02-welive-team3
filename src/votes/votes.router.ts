import express from "express";
import { allow, AllowedRole } from "../middlewares/allow.middleware";
import { handleVoteForOption, handleDeleteVote } from "./votes.controller";

const vote = express.Router();

// 투표하기 (사용자, 관리자 모두 가능)

vote.post("/:optionId/vote", allow(AllowedRole.USER), handleVoteForOption);

// 투표 취소 (사용자, 관리자 모두 가능)

vote.delete("/:optionId/vote", allow(AllowedRole.USER), handleDeleteVote);

export default vote;
