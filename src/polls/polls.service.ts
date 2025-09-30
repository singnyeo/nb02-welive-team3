import { AppDataSource } from "../config/data-source";
import { CreatePollDto } from "./dto/create-poll.dto";
import { Poll } from "../entities/poll.entity";
import { PollOption } from "../entities/poll-option.entity";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../types/error.type";
import { User } from "../entities/user.entity";
import { Apartment } from "../entities/apartment.entity";

// ============================
// : REPOSITORIES
// ============================
const userRepository = AppDataSource.getRepository(User);
const pollRepository = AppDataSource.getRepository(Poll);
const pollOptionRepository = AppDataSource.getRepository(PollOption);
const apartmentRepository = AppDataSource.getRepository(Apartment);

// ============================
// : SERVICE FUNCTIONS
// ============================

/**
 * 투표 생성
 */
export const createPoll = async (
  userId: string,
  data: CreatePollDto
): Promise<Poll> => {
  // 사용자 정보 조회 (apartment, pollBoard 정보 포함)
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: {
      apartment: {
        pollBoard: true,
      },
    },
  });

  if (!user) {
    throw new NotFoundError("사용자를 찾을 수 없습니다.");
  }

  if (!user.apartment) {
    throw new ForbiddenError("아파트 정보가 없는 사용자입니다.");
  }

  if (!user.apartment.pollBoard) {
    throw new InternalServerError("투표 게시판이 설정되지 않았습니다.");
  }

  // buildingPermission 유효성 검사
  if (
    data.buildingPermission !== undefined &&
    data.buildingPermission !== null
  ) {
    const apartment = await apartmentRepository.findOne({
      where: { id: user.apartment.id },
    });

    if (apartment) {
      const startDong = parseInt(apartment.startDongNumber);
      const endDong = parseInt(apartment.endDongNumber);

      if (
        data.buildingPermission < startDong ||
        data.buildingPermission > endDong
      ) {
        throw new BadRequestError(
          `유효하지 않은 동 번호입니다. (${startDong}동 ~ ${endDong}동 범위 내)`
        );
      }
    }
  }

  // 시작일과 종료일 검증
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);

  if (endDate <= startDate) {
    throw new BadRequestError("종료일은 시작일보다 늦어야 합니다.");
  }

  // 트랜잭션으로 투표와 옵션들 생성
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 투표 생성
    const poll = pollRepository.create({
      boardId: user.apartment.pollBoard.id,
      userId: user.id,
      title: data.title,
      content: data.content,
      writerName: user.name,
      buildingPermission: data.buildingPermission,
      startDate: startDate,
      endDate: endDate,
      status: data.status,
      user: user,
    });

    const savedPoll = await queryRunner.manager.save(Poll, poll);

    // 투표 옵션들 생성
    const pollOptions = data.options.map((option) => {
      return pollOptionRepository.create({
        title: option.title,
        voteCount: 0,
        poll: savedPoll,
        pollId: savedPoll.pollId,
      });
    });

    await queryRunner.manager.save(PollOption, pollOptions);

    await queryRunner.commitTransaction();

    return savedPoll;
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Poll creation error:", error);
    throw new InternalServerError("투표 생성 중 오류가 발생했습니다.");
  } finally {
    await queryRunner.release();
  }
};
