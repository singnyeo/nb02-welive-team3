import { RequestHandler } from "express";
import { validateCreatePoll } from "./dto/create-poll.dto";
import { BadRequestError } from "../types/error.type";
import { createPoll } from "./polls.service";
import { getUser } from "../utils/user.util";

export const handleCreatePoll: RequestHandler = async (req, res, next) => {
  try {
    // 요청 유효성 검사
    const validatedData = validateCreatePoll(req.body);

    // 현재 로그인한 사용자 정보 가져오기
    const user = getUser(req);

    // 투표 생성
    const createdPoll = await createPoll(user.id, validatedData);

    // 응답 반환
    res.status(201).json({
      message: "투표가 성공적으로 생성되었습니다",
      pollId: createdPoll.pollId,
    });
  } catch (error) {
    // Zod 검증 에러 처리
    if (error instanceof Error && error.name === "ZodError") {
      return next(
        new BadRequestError(
          "잘못된 요청(필수사항 누락 또는 잘못된 입력값)입니다."
        )
      );
    }
    next(error);
  }
};
