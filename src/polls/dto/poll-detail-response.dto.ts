import { OptionResponse } from "./option-response.dto";

export interface PollDetailResponseDto {
  pollId: string;
  userId: string;
  title: string;
  writerName: string;
  buildingPermission?: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  status: "IN_PROGRESS" | "PENDING" | "CLOSED";
  content: string;
  boardName: string;
  options: OptionResponse[];
}
