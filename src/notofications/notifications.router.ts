import { Router } from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import { handleGetNotifications } from './notifications.controller';

const notifications = Router();

notifications.get('/sse', allow(AllowedRole.USER), handleGetNotifications);

export default notifications;
