import * as repository from "./complaint.repository";
import { CreateComplaintInput, UpdateComplaintInput, UpdateComplaintStatusInput } from "./complaint.schema";
import { v4 as uuidv4 } from "uuid"; // UUID 생성용

export async function createComplaintService(data: CreateComplaintInput) {
  // 테스트용 임의 userId 추가
  const complaintData = { ...data, userId: uuidv4() };
  return await repository.createComplaint(complaintData);
}

export async function getComplaintsService(page: number, limit: number) {
  return await repository.getComplaints(page, limit);
}

export async function getComplaintByIdService(complaintId: string) {
  return await repository.getComplaintById(complaintId);
}

export async function updateComplaintService(complaintId: string, data: UpdateComplaintInput) {
  return await repository.updateComplaint(complaintId, data);
}

export async function deleteComplaintService(complaintId: string) {
  return await repository.deleteComplaint(complaintId);
}

export async function updateComplaintStatusService(complaintId: string, data: UpdateComplaintStatusInput) {
  return await repository.updateComplaintStatus(complaintId, data);
}
