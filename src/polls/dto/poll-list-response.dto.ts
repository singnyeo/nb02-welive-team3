export interface PollListResponseDto {
  pollId: string;
  userId: string;
  title: string;
  writerName: string;
  buildingPermission?: string;
  createdAt: string;
  updatedAt: string;
  startDate: string;
  endDate: string;
  status: "IN_PROGRESS" | "PENDING" | "COMPLETED";
}
