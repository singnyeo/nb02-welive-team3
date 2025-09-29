import * as repository from "./complaint.repository";
import {
  CreateComplaintInput,
  UpdateComplaintInput,
  UpdateComplaintStatusInput,
} from "./complaint.schema";

export async function createComplaintService(data: CreateComplaintInput) {
  return await repository.createComplaint(data);
}

export async function getComplaintsService(page: number, limit: number) {
  return await repository.getComplaints(page, limit);
}

export async function getComplaintByIdService(complaintId: string) {
  return await repository.getComplaintById(complaintId);
}

export async function updateComplaintService(
  complaintId: string,
  data: UpdateComplaintInput
) {
  return await repository.updateComplaint(complaintId, data);
}

export async function deleteComplaintService(complaintId: string) {
  return await repository.deleteComplaint(complaintId);
}

export async function updateComplaintStatusService(
  complaintId: string,
  data: UpdateComplaintStatusInput
) {
  return await repository.updateComplaintStatus(complaintId, data);
}
