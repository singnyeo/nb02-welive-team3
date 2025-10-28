import { Request, Response } from "express";
import { processExpiredPolls } from "./poll-scheduler.service";

/**
 * Poll 스케줄러 상태 확인 (개발용)
 * GET /api/poll-scheduler/ping
 */
export const handlePing = (_req: Request, res: Response) => {
  res.status(200).json({
    message: "Poll scheduler is running.",
  });
};

/**
 * 수동으로 스케줄러 실행 (개발/테스트용)
 * POST /api/poll-scheduler/run
 */
export const handleManualRun = async (_req: Request, res: Response) => {
  try {
    await processExpiredPolls();

    res.status(200).json({
      message: "Poll scheduler executed successfully.",
    });
  } catch (error: any) {
    console.error("[Poll Scheduler Controller] Error:", error);

    res.status(500).json({
      message: "Failed to execute poll scheduler.",
      error: error.message,
    });
  }
};
