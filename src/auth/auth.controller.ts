import { RequestHandler } from 'express';

export const handleSignup: RequestHandler = (_req, res) => {
  res.status(200).send('handleSignup');
};

export const handleSignupAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleSignupAdmin');
};

export const handleSignupSuperAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleSignupSuperAdmin');
};

export const handleLogin: RequestHandler = (_req, res) => {
  res.status(200).send('handleLogin');
};

export const handleLogout: RequestHandler = (_req, res) => {
  res.status(200).send('handleLogout');
};

export const handleRefresh: RequestHandler = (_req, res) => {
  res.status(200).send('handleRefresh');
};

export const handleApproveAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleApproveAdmin');
};

export const handleRejectAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleRejectAdmin');
};

export const handleApproveAdmins: RequestHandler = (_req, res) => {
  res.status(200).send('handleApproveAdmins');
};
export const handleRejectAdmins: RequestHandler = (_req, res) => {
  res.status(200).send('handleRejectAdmins');
};

export const handleApproveUser: RequestHandler = (_req, res) => {
  res.status(200).send('handleApproveUser');
};

export const handleRejectUser: RequestHandler = (_req, res) => {
  res.status(200).send('handleRejectUser');
};

export const handleApproveUsers: RequestHandler = (_req, res) => {
  res.status(200).send('handleApproveUsers');
};

export const handleRejectUsers: RequestHandler = (_req, res) => {
  res.status(200).send('handleRejectUsers');
};

export const handleUpdateAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleUpdateAdmin');
};

export const handleDeleteAdmin: RequestHandler = (_req, res) => {
  res.status(200).send('handleDeleteAdmin');
};

export const handleCleanup: RequestHandler = (_req, res) => {
  res.status(200).send('handleCleanup');
};
