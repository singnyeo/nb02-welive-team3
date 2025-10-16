import { RequestHandler, Response } from 'express';
import { getNotifications, markNotificationAsRead } from './notifications.service';
import { getUser } from '../utils/user.util';

const clients = new Map<string, Response>();

export const handleGetNotifications: RequestHandler = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  res.flushHeaders();

  const user = getUser(req);
  const userId = String(user.id);

  // 기존 연결이 있으면 닫기 (중복 방지)
  const existing = clients.get(userId);
  if (existing) existing.end();

  clients.set(userId, res);

  const sendNotifications = async () => {
    try {
      const notifications = await getNotifications(userId);
      const payload = { type: 'alarm', data: notifications };

      res.write(`event: alarm\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'Failed to fetch notifications' })}\n\n`);
    }
  };

  const intervalId = setInterval(sendNotifications, 5000);
  sendNotifications();

  req.on('close', () => {
    clearInterval(intervalId);
    clients.delete(userId);
  });
};

export const closeSSE = (userId: string) => {
  const res = clients.get(userId);
  if (res) {
    res.end();
    clients.delete(userId);
  }
};

export const sendNotificationToUser = (userId: string, payload: any) => {
  const res = clients.get(userId);
  if (!res) return;
  res.write(`event: alarm\n`);
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
};

export const handleReadNotification: RequestHandler = async (req, res) => {
  const user = getUser(req);
  const userId = String(user.id);
  const notificationId = req.params.id;

  const userNotifications = await getNotifications(userId);
  const notification = userNotifications.find((n) => n.notificationId === notificationId);

  if (!notification) {
    return res.status(404).json({ message: 'Notification not found' });
  }

  await markNotificationAsRead(userId, notificationId);

  res.status(200).json({ message: 'Notification marked as read' });
};
