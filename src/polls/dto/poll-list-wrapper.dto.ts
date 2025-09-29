import { PollListResponseDto } from "./poll-list-response.dto";

export interface PollsListWrapperDto {
  polls: PollListResponseDto[];
  totalCount: number;
}
