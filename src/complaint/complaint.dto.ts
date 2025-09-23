import { ComplaintStatus } from "../entities/complaint.entity";

export class CreateComplaintDto {
  title!: string;
  content!: string;
  isPublic?: boolean;
  boardId?: string | null;
  status?: ComplaintStatus;
}

export class UpdateComplaintDto {
  title?: string;
  content?: string;
  isPublic?: boolean;
}

export class UpdateComplaintStatusDto {
  status!: ComplaintStatus;
}
