import { Request, Response, NextFunction } from "express";
import { createPoll, getPolls, getPollDetail } from "./polls.service";
import { CreatePollDto } from "./dto/create-poll.dto";
import { validatePollQuery } from "./dto/poll-query-params.dto";
import { BadRequestError } from "../types/error.type";
import { ZodError } from "zod";

/**
 * 투표 생성 핸들러
 */
export const handleCreatePoll = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;

    if (!userId) {
      throw new BadRequestError("사용자 정보를 찾을 수 없습니다.");
    }

    const pollData: CreatePollDto = req.body;

    // 기본 유효성 검사
    if (!pollData.title || !pollData.content) {
      throw new BadRequestError("잘못된 요청: 제목과 내용은 필수입니다.");
    }

    if (!pollData.options || !Array.isArray(pollData.options)) {
      throw new BadRequestError("잘못된 요청: 투표 옵션이 필요합니다.");
    }

    if (pollData.options.length < 2) {
      throw new BadRequestError(
        "잘못된 요청: 최소 2개 이상의 옵션이 필요합니다."
      );
    }

    // 날짜 유효성 검사
    const startDate = new Date(pollData.startDate);
    const endDate = new Date(pollData.endDate);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new BadRequestError("잘못된 요청: 유효하지 않은 날짜 형식입니다.");
    }

    const poll = await createPoll(userId, pollData);

    res.status(201).json({
      message: "투표가 성공적으로 생성되었습니다",
      pollId: poll.pollId,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 투표 목록 조회 핸들러
 */
export const handleGetPolls = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    if (!userId) {
      throw new BadRequestError("사용자 정보를 찾을 수 없습니다.");
    }

    // 쿼리 파라미터 유효성 검사 - Zod 에러를 BadRequestError로 변환
    let queryParams;
    try {
      queryParams = validatePollQuery(req.query);
    } catch (error) {
      if (error instanceof ZodError) {
        // Zod 에러 메시지를 추출하여 BadRequestError로 변환
        const errorMessage = error.issues.map((e) => e.message).join(", ");
        throw new BadRequestError(`잘못된 요청: ${errorMessage}`);
      }
      throw error;
    }

    // 투표 목록 조회
    const result = await getPolls(userId, userRole, queryParams);

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * 투표 상세 조회 핸들러
 */
export const handleGetPollDetail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;
    const { pollId } = req.params;

    if (!userId) {
      throw new BadRequestError("사용자 정보를 찾을 수 없습니다.");
    }

    if (!pollId) {
      throw new BadRequestError("투표 ID가 필요합니다.");
    }

    // UUID 형식 검증 (선택사항)
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(pollId)) {
      throw new BadRequestError("유효하지 않은 투표 ID 형식입니다.");
    }

    // 투표 상세 조회
    const pollDetail = await getPollDetail(pollId, userId, userRole);

    res.status(200).json(pollDetail);
  } catch (error) {
    next(error);
  }
};
