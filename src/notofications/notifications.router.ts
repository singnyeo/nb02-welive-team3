import { Router } from 'express';
import { allow, AllowedRole } from '../middlewares/allow.middleware';
import { handleGetNotifications, handleReadNotification } from './notifications.controller';

const notifications = Router();

notifications.get('/sse', allow(AllowedRole.USER), handleGetNotifications);
notifications.patch('/:id/read', allow(AllowedRole.USER), handleReadNotification);

export default notifications;
