import { AppDataSource } from "../config/data-source";
import { CreatePollDto } from "./dto/create-poll.dto";
import { Poll } from "../entities/poll.entity";
import { PollOption } from "../entities/poll-option.entity";
import { PollQueryParams } from "./dto/poll-query-params.dto";
import { PollsListWrapperDto } from "./dto/poll-list-wrapper.dto";
import { PollListResponseDto } from "./dto/poll-list-response.dto";
import { PollDetailResponseDto } from "./dto/poll-detail-response.dto";
import { UpdatePollDto } from "./dto/update-poll.dto";
// import { OptionResponse } from "./dto/option-response.dto";
import { UserRole } from "../entities/user.entity";
import {
  BadRequestError,
  ForbiddenError,
  InternalServerError,
  NotFoundError,
} from "../types/error.type";

/**
 * 투표 생성
 */
export const createPoll = async (
  userId: string,
  data: CreatePollDto
): Promise<Poll> => {
  // Repository를 함수 내부에서 가져오기
  const userRepository = AppDataSource.getRepository("User");
  const pollRepository = AppDataSource.getRepository("Poll");
  const pollOptionRepository = AppDataSource.getRepository("PollOption");
  const apartmentRepository = AppDataSource.getRepository("Apartment");

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

  // buildingPermission 유효성 검사 (설정된 경우)
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

/**
 * 투표 목록 조회
 */
export const getPolls = async (
  userId: string,
  userRole: string,
  queryParams: PollQueryParams
): Promise<PollsListWrapperDto> => {
  const userRepository = AppDataSource.getRepository("User");
  const pollRepository = AppDataSource.getRepository("Poll");

  // 페이지네이션 계산
  const skip = (queryParams.page - 1) * queryParams.limit;
  const take = queryParams.limit;

  // 사용자 정보 조회
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: {
      apartment: true,
      residences: true,
    },
  });

  if (!user) {
    throw new NotFoundError("사용자를 찾을 수 없습니다.");
  }

  if (!user.apartment) {
    throw new ForbiddenError("아파트 정보가 없는 사용자입니다.");
  }

  // 쿼리 빌더 생성
  const queryBuilder = pollRepository
    .createQueryBuilder("poll")
    .leftJoinAndSelect("poll.user", "user")
    .where(
      "poll.boardId IN (SELECT id FROM poll_boards WHERE apartmentId = :apartmentId)",
      {
        apartmentId: user.apartment.id,
      }
    );

  // 일반 사용자(USER)인 경우 권한 필터링 추가
  if (userRole === "USER") {
    // 사용자의 거주지 동 번호 가져오기
    const userDongNumbers =
      user.residences?.map((residence: any) => parseInt(residence.dong)) || [];

    if (userDongNumbers.length > 0) {
      // buildingPermission이 null(전체) 또는 사용자의 동 번호와 일치하는 투표만
      queryBuilder.andWhere(
        "(poll.buildingPermission IS NULL OR poll.buildingPermission IN (:...dongNumbers))",
        { dongNumbers: userDongNumbers }
      );
    } else {
      // 거주지 정보가 없으면 전체 공개 투표만
      queryBuilder.andWhere("poll.buildingPermission IS NULL");
    }
  }
  // ADMIN이나 SUPER_ADMIN은 모든 투표 조회 가능

  // 정렬 (최신순)
  queryBuilder.orderBy("poll.createdAt", "DESC");

  // 페이지네이션 적용
  queryBuilder.skip(skip).take(take);

  // 실행
  const [polls, totalCount] = await queryBuilder.getManyAndCount();

  // DTO 변환
  const pollsDto: PollListResponseDto[] = polls.map((poll) => ({
    pollId: poll.pollId,
    userId: poll.userId,
    title: poll.title,
    writerName: poll.writerName,
    buildingPermission: poll.buildingPermission,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
    startDate: poll.startDate.toISOString(),
    endDate: poll.endDate.toISOString(),
    status: poll.status,
  }));

  return {
    polls: pollsDto,
    totalCount,
  };
};

/**
 * 투표 상세 조회
 */
export const getPollDetail = async (
  pollId: string,
  userId: string,
  userRole: string
): Promise<PollDetailResponseDto> => {
  const pollRepository = AppDataSource.getRepository("Poll");
  const userRepository = AppDataSource.getRepository("User");
  const pollBoardRepository = AppDataSource.getRepository("PollBoard");

  // 사용자 정보 조회
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: {
      apartment: true,
      resident: true,
    },
  });

  if (!user) {
    throw new NotFoundError("사용자를 찾을 수 없습니다.");
  }

  // 투표 조회 (옵션 포함)
  const poll = await pollRepository.findOne({
    where: { pollId },
    relations: {
      user: true,
      options: true,
    },
  });

  if (!poll) {
    throw new NotFoundError("투표를 찾을 수 없습니다.");
  }

  // 투표 게시판 정보 조회
  const pollBoard = await pollBoardRepository.findOne({
    where: { id: poll.boardId },
    relations: {
      apartment: true,
    },
  });

  if (!pollBoard) {
    throw new InternalServerError("투표 게시판 정보를 찾을 수 없습니다.");
  }

  // 같은 아파트 투표인지 확인
  if (user.apartment?.id !== pollBoard.apartment?.id) {
    throw new ForbiddenError("다른 아파트의 투표는 조회할 수 없습니다.");
  }

  // 일반 사용자(USER)인 경우 권한 확인
  if (userRole === UserRole.USER) {
    // buildingPermission이 설정된 경우, 해당 동 거주자만 조회 가능
    if (
      poll.buildingPermission !== undefined &&
      poll.buildingPermission !== null
    ) {
      const userDong = user.resident ? parseInt(user.resident.dong) : null;

      if (!userDong || userDong !== poll.buildingPermission) {
        throw new ForbiddenError("해당 투표를 조회할 권한이 없습니다.");
      }
    }
    // buildingPermission이 null이면 전체 입주민 조회 가능
  }
  // ADMIN이나 SUPER_ADMIN은 모든 투표 조회 가능

  // 옵션 정보를 OptionResponse 형태로 변환
  const optionsDto = poll.options.map(
    (option: { id: any; title: any; voteCount: any }) => ({
      id: option.id,
      title: option.title,
      voteCount: option.voteCount,
    })
  );

  // 날짜를 ISO 문자열로 변환
  const responseDto: PollDetailResponseDto = {
    pollId: poll.pollId,
    userId: poll.userId,
    title: poll.title,
    writerName: poll.writerName,
    buildingPermission: poll.buildingPermission,
    createdAt: poll.createdAt.toISOString(),
    updatedAt: poll.updatedAt.toISOString(),
    startDate: new Date(poll.startDate).toISOString(),
    endDate: new Date(poll.endDate).toISOString(),
    status: poll.status,
    content: poll.content,
    boardName: "주민투표 게시판", // 또는 pollBoard.apartment?.name + " 투표 게시판"
    options: optionsDto,
  };

  return responseDto;
};

/**
 * 투표 수정
 */
export const updatePoll = async (
  pollId: string,
  userId: string,
  userRole: string,
  updateData: UpdatePollDto
): Promise<void> => {
  const pollRepository = AppDataSource.getRepository("Poll");
  const pollOptionRepository = AppDataSource.getRepository("PollOption");
  const userRepository = AppDataSource.getRepository("User");

  // 권한 확인 - 관리자만 수정 가능
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenError("투표 수정 권한이 없습니다.");
  }

  // 사용자 정보 확인
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: { apartment: true },
  });

  if (!user || !user.apartment) {
    throw new NotFoundError("사용자 정보를 찾을 수 없습니다.");
  }

  // 투표 정보 조회
  const poll = await pollRepository.findOne({
    where: { pollId },
    relations: ["options"],
  });

  if (!poll) {
    throw new NotFoundError("투표를 찾을 수 없습니다.");
  }

  // 같은 아파트의 투표인지 확인 (SUPER_ADMIN은 제외)
  if (userRole !== UserRole.SUPER_ADMIN) {
    const pollBoardRepository = AppDataSource.getRepository("PollBoard");
    const pollBoard = await pollBoardRepository.findOne({
      where: { id: poll.boardId },
    });

    if (!pollBoard || pollBoard.apartmentId !== user.apartment.id) {
      throw new ForbiddenError("다른 아파트의 투표는 수정할 수 없습니다.");
    }
  }

  // 투표가 이미 시작된 경우 수정 불가
  const now = new Date();
  const startDate = new Date(poll.startDate);

  if (now >= startDate) {
    throw new BadRequestError("이미 시작된 투표는 수정할 수 없습니다.");
  }

  // buildingPermission 유효성 검사 (설정된 경우)
  if (
    updateData.buildingPermission !== undefined &&
    updateData.buildingPermission !== null
  ) {
    const apartmentRepository = AppDataSource.getRepository("Apartment");
    const apartment = await apartmentRepository.findOne({
      where: { id: user.apartment.id },
    });

    if (apartment) {
      const startDong = parseInt(apartment.startDongNumber);
      const endDong = parseInt(apartment.endDongNumber);

      if (
        updateData.buildingPermission < startDong ||
        updateData.buildingPermission > endDong
      ) {
        throw new BadRequestError(
          `유효하지 않은 동 번호입니다. (${startDong}동 ~ ${endDong}동 범위 내)`
        );
      }
    }
  }

  // 날짜 유효성 검사
  const newStartDate = new Date(updateData.startDate);
  const newEndDate = new Date(updateData.endDate);

  if (newEndDate <= newStartDate) {
    throw new BadRequestError("종료일은 시작일보다 늦어야 합니다.");
  }

  // 트랜잭션으로 투표 및 옵션 수정
  const queryRunner = AppDataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    // 투표 정보 업데이트
    await queryRunner.manager.update(Poll, pollId, {
      title: updateData.title,
      content: updateData.content,
      buildingPermission: updateData.buildingPermission,
      startDate: newStartDate,
      endDate: newEndDate,
      status: updateData.status,
    });

    // 옵션 처리 (있는 경우)
    if (updateData.options && Array.isArray(updateData.options)) {
      // 기존 옵션 삭제
      await queryRunner.manager.delete(PollOption, { pollId });

      // 새 옵션 추가
      const newOptions = updateData.options.map((option: any) => {
        return pollOptionRepository.create({
          title: option.title,
          voteCount: 0,
          pollId: pollId,
        });
      });

      await queryRunner.manager.save(PollOption, newOptions);
    }

    await queryRunner.commitTransaction();
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error("Poll update error:", error);
    throw new InternalServerError("투표 수정 중 오류가 발생했습니다.");
  } finally {
    await queryRunner.release();
  }
};

/**
 * 투표 삭제
 */
export const deletePoll = async (
  pollId: string,
  userId: string,
  userRole: string
): Promise<void> => {
  const pollRepository = AppDataSource.getRepository("Poll");
  const userRepository = AppDataSource.getRepository("User");

  // 권한 확인 - 관리자만 삭제 가능
  if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN) {
    throw new ForbiddenError("투표 삭제 권한이 없습니다.");
  }

  // 사용자 정보 확인
  const user = await userRepository.findOne({
    where: { id: userId },
    relations: { apartment: true },
  });

  if (!user || !user.apartment) {
    throw new NotFoundError("사용자 정보를 찾을 수 없습니다.");
  }

  // 투표 정보 조회
  const poll = await pollRepository.findOne({
    where: { pollId },
  });

  if (!poll) {
    throw new NotFoundError("투표를 찾을 수 없습니다.");
  }

  // 같은 아파트의 투표인지 확인 (SUPER_ADMIN은 제외)
  if (userRole !== UserRole.SUPER_ADMIN) {
    const pollBoardRepository = AppDataSource.getRepository("PollBoard");
    const pollBoard = await pollBoardRepository.findOne({
      where: { id: poll.boardId },
    });

    if (!pollBoard || pollBoard.apartmentId !== user.apartment.id) {
      throw new ForbiddenError("다른 아파트의 투표는 삭제할 수 없습니다.");
    }
  }

  // 투표가 이미 시작된 경우 삭제 불가
  const now = new Date();
  const startDate = new Date(poll.startDate);

  if (now >= startDate) {
    throw new BadRequestError("이미 시작된 투표는 삭제할 수 없습니다.");
  }

  // 투표 삭제 (cascade로 옵션도 함께 삭제됨)
  await pollRepository.delete({ pollId });
};
