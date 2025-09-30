import { AppDataSource } from "../config/data-source";
import { Complaint, ComplaintStatus } from "../entities/complaint.entity";
import { CreateComplaintInput, UpdateComplaintInput, UpdateComplaintStatusInput } from "./complaint.schema";

const complaintRepository = AppDataSource.getRepository(Complaint);

export async function createComplaint(data: CreateComplaintInput) {
  return await complaintRepository.save(data);
}

export async function getComplaints(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return await complaintRepository.find({
    skip,
    take: limit,
    order: { createdAt: "DESC" },
  });
}

export async function getComplaintById(complaintId: string) {
  return await complaintRepository.findOneBy({ complaintId });
}

export async function updateComplaint(complaintId: string, data: UpdateComplaintInput) {
  await complaintRepository.update({ complaintId }, data);
  return getComplaintById(complaintId);
}

export async function deleteComplaint(complaintId: string) {
  return await complaintRepository.delete({ complaintId });
}

export async function updateComplaintStatus(complaintId: string, data: UpdateComplaintStatusInput) {
  await complaintRepository.update({ complaintId }, { status: data.status as ComplaintStatus });
  return getComplaintById(complaintId);
}
