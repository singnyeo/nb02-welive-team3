import express from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import {
  handleCreateComplaint,
  handleGetComplaints,
  handleGetComplaint,
  handleUpdateComplaint,
  handleDeleteComplaint,
  handleUpdateComplaintStatus,
} from './complaint.controller';

const complaint = express.Router();

/**
 * 민원 등록
 * POST /api/complaints
 */
complaint.post('/', allow(AllowedRole.USER), handleCreateComplaint);

/**
 * 전체 민원 조회
 * GET /api/complaints?page=&limit=
 */
complaint.get('/', allow(AllowedRole.USER), handleGetComplaints);

/**
 * 민원 상세 조회
 * GET /api/complaints/:complaintId
 */
complaint.get('/:complaintId', allow(AllowedRole.USER), handleGetComplaint);

/**
 * 민원 수정
 * PATCH /api/complaints/:complaintId
 */
complaint.patch('/:complaintId', allow(AllowedRole.USER), handleUpdateComplaint);

/**
 * 민원 삭제
 * DELETE /api/complaints/:complaintId
 */
complaint.delete('/:complaintId', allow(AllowedRole.USER), handleDeleteComplaint);

/**
 * 민원 상태 수정
 * PATCH /api/complaints/:complaintId/status
 */
complaint.patch('/:complaintId/status', allow(AllowedRole.ADMIN), handleUpdateComplaintStatus);

export default complaint;
