import { Request, Response } from "express";
import * as service from "./complaint.service";
import {
  createComplaintSchema,
  updateComplaintSchema,
  updateComplaintStatusSchema,
} from "./complaint.schema";

export const handleCreateComplaint = async (req: Request, res: Response) => {
  const data = createComplaintSchema.parse(req.body);
  await service.createComplaintService(data);
  res.status(201).json({ message: "정상적으로 등록 처리되었습니다" });
};

export const handleGetComplaints = async (req: Request, res: Response) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const complaints = await service.getComplaintsService(page, limit);
  res.json(complaints);
};

export const handleGetComplaint = async (req: Request, res: Response) => {
  const { complaintId } = req.params;
  const complaint = await service.getComplaintByIdService(complaintId);
  res.json(complaint);
};

export const handleUpdateComplaint = async (req: Request, res: Response) => {
  const { complaintId } = req.params;
  const data = updateComplaintSchema.parse(req.body);
  const complaint = await service.updateComplaintService(complaintId, data);
  res.json(complaint);
};

export const handleDeleteComplaint = async (req: Request, res: Response) => {
  const { complaintId } = req.params;
  await service.deleteComplaintService(complaintId);
  res.json({ message: "정상적으로 삭제 처리되었습니다" });
};

export const handleUpdateComplaintStatus = async (req: Request, res: Response) => {
  const { complaintId } = req.params;
  const data = updateComplaintStatusSchema.parse(req.body);
  const complaint = await service.updateComplaintStatusService(complaintId, data);
  res.json(complaint);
};
