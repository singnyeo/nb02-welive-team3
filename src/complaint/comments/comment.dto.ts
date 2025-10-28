import { BoardType } from "../../entities/complaint-comment.entity";

export class CreateCommentDto {
  content!: string;
  boardType!: BoardType; // COMPLAINT | NOTICE
  boardId!: string; // complaintId | noticeId | pollId
}

export class UpdateCommentDto {
  content!: string;
  boardType!: BoardType; // COMPLAINT | NOTICE
  boardId!: string;
}
