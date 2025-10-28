import cron from "node-cron";
import { processExpiredPolls } from "./poll-scheduler.service";

/**
 * Poll Scheduler 초기화
 * 서버 시작 시 한 번 호출되어야 함
 */
export const initializePollScheduler = () => {
  console.log("[Poll Scheduler] Initializing poll scheduler...");

  // 매 1분마다 실행 (테스트용)
  // Cron 표현식: "초 분 시 일 월 요일"
  // "0 * * * * *" = 매 1분마다
  // 프로덕션에서는 "0 0 * * * *" (매 시간 정각) 사용 권장
  cron.schedule("0 0 * * * *", async () => {
    console.log(
      `[Poll Scheduler] Running scheduled task at ${new Date().toISOString()}`
    );

    try {
      await processExpiredPolls();
    } catch (error) {
      console.error("[Poll Scheduler] Scheduled task failed:", error);
    }
  });

  console.log("[Poll Scheduler] ✅ Scheduler initialized successfully.");
  console.log("[Poll Scheduler] ⏰ Running every 1 minute (test mode).");

  // 서버 시작 시 즉시 한 번 실행
  console.log("[Poll Scheduler] Running initial check...");
  processExpiredPolls().catch((error) => {
    console.error("[Poll Scheduler] Initial run failed:", error);
  });
};
