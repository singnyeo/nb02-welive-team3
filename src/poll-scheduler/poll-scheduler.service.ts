import { AppDataSource } from "../config/data-source";
import { Poll } from "../entities/poll.entity";
import { LessThanOrEqual } from "typeorm";
import { createNoticeWithUserId } from "../notice/notice.service";

/**
 * 마감된 투표를 찾아서 처리하는 함수
 */
export const processExpiredPolls = async (): Promise<void> => {
  const pollRepository = AppDataSource.getRepository(Poll);

  try {
    // 현재 시간보다 endDate가 이전이고, 아직 CLOSED 상태가 아닌 투표들 찾기
    const expiredPolls = await pollRepository.find({
      where: [
        {
          endDate: LessThanOrEqual(new Date()),
          status: "IN_PROGRESS", // 진행 중인 투표
        },
        {
          endDate: LessThanOrEqual(new Date()),
          status: "PENDING", // ✅ 대기 중인 투표도 포함
        },
      ],
      relations: ["options"],
    });

    if (expiredPolls.length === 0) {
      console.log("[Poll Scheduler] No expired polls found.");
      return;
    }

    console.log(
      `[Poll Scheduler] Found ${expiredPolls.length} expired poll(s). Processing...`
    );

    // 각 마감된 투표 처리
    for (const poll of expiredPolls) {
      await processSingleExpiredPoll(poll);
    }

    console.log("[Poll Scheduler] All expired polls processed successfully.");
  } catch (error) {
    console.error("[Poll Scheduler] Error processing expired polls:", error);
    throw error;
  }
};

/**
 * 개별 마감된 투표를 처리하는 함수
 */
const processSingleExpiredPoll = async (poll: Poll): Promise<void> => {
  const pollRepository = AppDataSource.getRepository(Poll);

  try {
    // 1. 투표 상태를 CLOSED로 변경
    poll.status = "CLOSED";
    await pollRepository.save(poll);

    console.log(`[Poll Scheduler] Poll ${poll.pollId} marked as CLOSED.`);

    // 2. 투표 결과 집계
    const result = calculatePollResult(poll);

    // 3. 공지사항 생성
    await createPollResultNotice(poll, result);
  } catch (error) {
    console.error(
      `[Poll Scheduler] Error processing poll ${poll.pollId}:`,
      error
    );
    throw error;
  }
};

/**
 * 투표 결과를 집계하는 함수
 */
const calculatePollResult = (poll: Poll) => {
  if (!poll.options || poll.options.length === 0) {
    return {
      totalVotes: 0,
      winnerOption: null,
      options: [],
    };
  }

  // 전체 투표 수 계산
  const totalVotes = poll.options.reduce(
    (sum, option) => sum + option.voteCount,
    0
  );

  // 가장 많은 득표를 받은 옵션 찾기
  const winnerOption = poll.options.reduce((prev, current) =>
    prev.voteCount > current.voteCount ? prev : current
  );

  // 옵션별 결과 정리
  const options = poll.options.map((option) => ({
    title: option.title,
    voteCount: option.voteCount,
    percentage:
      totalVotes > 0
        ? ((option.voteCount / totalVotes) * 100).toFixed(1)
        : "0.0",
  }));

  return {
    totalVotes,
    winnerOption: {
      title: winnerOption.title,
      voteCount: winnerOption.voteCount,
    },
    options,
  };
};

/**
 * 투표 결과를 공지사항으로 생성하는 함수
 */
const createPollResultNotice = async (
  poll: Poll,
  result: {
    totalVotes: number;
    winnerOption: { title: string; voteCount: number } | null;
    options: Array<{ title: string; voteCount: number; percentage: string }>;
  }
): Promise<void> => {
  try {
    // 공지사항 내용 생성
    const noticeContent = generateNoticeContent(poll, result);

    console.log(
      `[Poll Scheduler] Notice content for poll ${poll.pollId}:\n${noticeContent}`
    );

    // 공지사항 생성 (실제 API 호출)
    // 주의: poll.boardId와 notices.boardId는 다른 테이블을 참조
    // poll.boardId는 투표 게시판, notices.boardId는 notice_boards 테이블
    const noticeBoardId = "057a9db6-2ff7-4cf9-8670-bbd242cccfb4"; // notice_boards 테이블의 실제 ID

    await createNoticeWithUserId({
      userId: poll.userId,
      boardId: noticeBoardId,
      category: "RESIDENT_VOTE",
      title: `[투표 결과] ${poll.title}`,
      content: noticeContent.substring(0, 200), // 최대 200자 제한
      isPinned: false,
      startDate: undefined,
      endDate: undefined,
    } as any);

    console.log(
      `[Poll Scheduler] ✅ Notice created for poll "${poll.title}" (pollId: ${poll.pollId})`
    );
  } catch (error) {
    console.error(
      `[Poll Scheduler] Error creating notice for poll ${poll.pollId}:`,
      error
    );
    throw error;
  }
};

/**
 * 공지사항 내용을 생성하는 함수
 */
const generateNoticeContent = (
  poll: Poll,
  result: {
    totalVotes: number;
    winnerOption: { title: string; voteCount: number } | null;
    options: Array<{ title: string; voteCount: number; percentage: string }>;
  }
): string => {
  let content = `투표가 마감되었습니다.\n\n`;
  content += `📊 투표 제목: ${poll.title}\n`;
  content += `📅 투표 기간: ${poll.startDate.toLocaleDateString()} ~ ${poll.endDate.toLocaleDateString()}\n`;
  content += `👥 총 투표 수: ${result.totalVotes}표\n\n`;

  if (result.winnerOption) {
    content += `🏆 최다 득표: ${result.winnerOption.title} (${result.winnerOption.voteCount}표)\n\n`;
  }

  content += `📈 투표 결과:\n`;
  result.options.forEach((option, index) => {
    content += `${index + 1}. ${option.title}: ${option.voteCount}표 (${
      option.percentage
    }%)\n`;
  });

  return content;
};
