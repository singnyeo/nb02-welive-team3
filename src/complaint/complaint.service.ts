import * as repository from "./complaint.repository";
import { ComplaintListResponseDto, ComplaintDetailDto } from "./complaint.dto";
import { CreateComplaintInput, UpdateComplaintInput, UpdateComplaintStatusInput } from "./complaint.schema";
import { v4 as uuidv4 } from "uuid";

export async function createComplaintService(data: CreateComplaintInput) {
  // 테스트용 임의 userid 추가
  const complaintData = { ...data, userId: uuidv4() };
  return await repository.createComplaint(complaintData);
}

export async function getComplaintsService(page: number, limit: number) {
  const { complaints, totalCount } = await repository.getComplaints(page, limit);
  return new ComplaintListResponseDto(complaints, totalCount);
}

export async function getComplaintByIdService(complaintId: string) {
  const complaint = await repository.getComplaintById(complaintId);
  return complaint ? new ComplaintDetailDto(complaint) : null;
}

export async function updateComplaintService(complaintId: string, data: UpdateComplaintInput) {
  const complaint = await repository.updateComplaint(complaintId, data);
  return new ComplaintDetailDto(complaint);
}

export async function deleteComplaintService(complaintId: string) {
  return await repository.deleteComplaint(complaintId);
}

export async function updateComplaintStatusService(complaintId: string, data: UpdateComplaintStatusInput) {
  const complaint = await repository.updateComplaintStatus(complaintId, data);
  return new ComplaintDetailDto(complaint);
}
