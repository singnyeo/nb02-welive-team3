import express from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import {
<<<<<<< HEAD
=======
  handleApproveAdmin,
  handleApproveAdmins,
  handleApproveUser,
  handleApproveUsers,
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
  handleCleanup,
  handleDeleteAdmin,
  handleLogin,
  handleLogout,
  handleRefresh,
<<<<<<< HEAD
=======
  handleRejectAdmin,
  handleRejectAdmins,
  handleRejectUser,
  handleRejectUsers,
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
  handleSignup,
  handleSignupAdmin,
  handleSignupSuperAdmin,
  handleUpdateAdmin,
} from './auth.controller';

const auth = express.Router();

auth.post('/signup', allow(AllowedRole.NONE), handleSignup);
auth.post('/signup/admin', allow(AllowedRole.NONE), handleSignupAdmin);
auth.post('/signup/super-admin', allow(AllowedRole.NONE), handleSignupSuperAdmin);
auth.post('/login', allow(AllowedRole.NONE), handleLogin);
auth.post('/logout', allow(AllowedRole.USER), handleLogout);
auth.post('/refresh', allow(AllowedRole.USER), handleRefresh);
<<<<<<< HEAD
auth.patch('/admins/:id/status', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdminStatus);
auth.patch('/admins/status', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdminsStatus);
auth.patch('/residents/:id/status', allow(AllowedRole.ADMIN), handleUpdateResidentStatus);
auth.patch('/residents/status', allow(AllowedRole.ADMIN), handleUpdateResidentsStatus);
auth.patch('/admins/:id', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdmin);
auth.delete('/admins/:id', allow(AllowedRole.SUPER_ADMIN), handleDeleteAdmin);
auth.post('/cleanup', allow(AllowedRole.ADMIN), handleCleanup);
=======
auth.post('/approve-admin', allow(AllowedRole.SUPER_ADMIN), handleApproveAdmin);
auth.post('/reject-admin', allow(AllowedRole.SUPER_ADMIN), handleRejectAdmin);
auth.post('/approve-admins', allow(AllowedRole.SUPER_ADMIN), handleApproveAdmins);
auth.post('/reject-admins', allow(AllowedRole.SUPER_ADMIN), handleRejectAdmins);
auth.post('/approve-user/:residentId', allow(AllowedRole.ADMIN), handleApproveUser);
auth.post('/reject-user/:residentId', allow(AllowedRole.ADMIN), handleRejectUser);
auth.post('/approve-users', allow(AllowedRole.ADMIN), handleApproveUsers);
auth.post('/reject-users', allow(AllowedRole.ADMIN), handleRejectUsers);
auth.patch('/update-admin', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdmin); // [!] id 가 body 에 들어가서 처리됨.
auth.patch('/delete-admin/:adminId', allow(AllowedRole.SUPER_ADMIN), handleDeleteAdmin);
auth.post('/cleanup', allow(AllowedRole.SUPER_ADMIN), handleCleanup);
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)

export default auth;
