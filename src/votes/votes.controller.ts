import { Request, Response, NextFunction } from "express";
import { voteForOption, deleteVote } from "./votes.service";
import { BadRequestError } from "../types/error.type";

/**
 * 투표하기 핸들러
 */
export const handleVoteForOption = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { optionId } = req.params;

    if (!userId) {
      throw new BadRequestError("사용자 정보를 찾을 수 없습니다.");
    }

    if (!optionId) {
      throw new BadRequestError("옵션 ID가 필요합니다.");
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(optionId)) {
      throw new BadRequestError("유효하지 않은 옵션 ID 형식입니다.");
    }

    const result = await voteForOption(optionId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 투표 취소 핸들러
 */
export const handleDeleteVote = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const { optionId } = req.params;

    if (!userId) {
      throw new BadRequestError("사용자 정보를 찾을 수 없습니다.");
    }

    if (!optionId) {
      throw new BadRequestError("옵션 ID가 필요합니다.");
    }

    // UUID 형식 검증
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(optionId)) {
      throw new BadRequestError("유효하지 않은 옵션 ID 형식입니다.");
    }

    const result = await deleteVote(optionId, userId);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
