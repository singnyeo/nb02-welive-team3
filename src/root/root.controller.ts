import { RequestHandler } from 'express';
import { healthCheck } from './root.service';

export const handleGetHealthCheck: RequestHandler = async (_req, res) => {
  const data = await healthCheck();
  res.status(200).json(data);
};
