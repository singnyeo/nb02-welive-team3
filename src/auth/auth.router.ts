import express from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import {
  handleCleanup,
  handleDeleteAdmin,
  handleLogin,
  handleLogout,
  handleRefresh,
  handleSignup,
  handleSignupAdmin,
  handleSignupSuperAdmin,
  handleUpdateAdmin,
  handleUpdateAdminsStatus,
  handleUpdateAdminStatus,
  handleUpdateResidentsStatus,
  handleUpdateResidentStatus,
} from './auth.controller';

const auth = express.Router();

auth.post('/signup', allow(AllowedRole.NONE), handleSignup);
auth.post('/signup/admin', allow(AllowedRole.NONE), handleSignupAdmin);
auth.post('/signup/super-admin', allow(AllowedRole.NONE), handleSignupSuperAdmin);
auth.post('/login', allow(AllowedRole.NONE), handleLogin);
auth.post('/logout', allow(AllowedRole.USER), handleLogout);
auth.post('/refresh', allow(AllowedRole.USER), handleRefresh);
auth.patch('/admins/:id/status', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdminStatus);
auth.patch('/admins/status', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdminsStatus);
auth.patch('/residents/:id/status', allow(AllowedRole.ADMIN), handleUpdateResidentStatus);
auth.patch('/residents/status', allow(AllowedRole.ADMIN), handleUpdateResidentsStatus);
auth.patch('/admins/:id', allow(AllowedRole.SUPER_ADMIN), handleUpdateAdmin);
auth.delete('/admins/:id', allow(AllowedRole.SUPER_ADMIN), handleDeleteAdmin);
auth.post('/cleanup', allow(AllowedRole.ADMIN), handleCleanup);

export default auth;
