import * as repository from "./complaint.repository";
import {
  CreateComplaintInput,
  UpdateComplaintInput,
  UpdateComplaintStatusInput,
} from "./complaint.schema";
import {
  ComplaintDetailDto,
  ComplaintListResponseDto,
} from "./complaint.dto";

/**
 * 민원 등록
 */
export async function createComplaintService(
  data: CreateComplaintInput,
  userId: string
) {
  const complaintData = { ...data, userId };
  const complaint = await repository.createComplaint(complaintData);
  return new ComplaintDetailDto(complaint);
}

/**
 * 민원 목록 조회
 */
export async function getComplaintsService(page: number, limit: number) {
  const { complaints, totalCount } = await repository.getComplaints(page, limit);
  return new ComplaintListResponseDto(complaints, totalCount);
}

/**
 * 민원 상세 조회
 */
export async function getComplaintByIdService(complaintId: string) {
  const complaint = await repository.getComplaintById(complaintId);
  return complaint ? new ComplaintDetailDto(complaint) : null;
}

/**
 * 민원 수정
 */
export async function updateComplaintService(
  complaintId: string,
  data: UpdateComplaintInput,
  userId: string
) {
  const complaint = await repository.getComplaintById(complaintId);
  if (!complaint) throw new Error("존재하지 않는 민원입니다.");
  if (complaint.userId !== userId) throw new Error("수정 권한이 없습니다.");

  await repository.updateComplaint(complaintId, data);
  return new ComplaintDetailDto({ ...complaint, ...data });
}

/**
 * 민원 삭제
 */
export async function deleteComplaintService(complaintId: string, userId: string) {
  const complaint = await repository.getComplaintById(complaintId);
  if (!complaint) throw new Error("존재하지 않는 민원입니다.");
  if (complaint.userId !== userId) throw new Error("삭제 권한이 없습니다.");

  return await repository.deleteComplaint(complaintId);
}

/**
 * 민원 상태 변경 (관리자)
 */
export async function updateComplaintStatusService(
  complaintId: string,
  data: UpdateComplaintStatusInput,
  userRole: string
) {
  if (userRole !== "ADMIN") throw new Error("상태 변경 권한이 없습니다.");

  const complaint = await repository.updateComplaintStatus(complaintId, data);
  return new ComplaintDetailDto(complaint);
}
