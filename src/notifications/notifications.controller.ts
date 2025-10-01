import { RequestHandler } from 'express';
import { getNotifications } from './notifications.service';
import { getUser } from '../utils/user.util';

export const handleGetNotifications: RequestHandler = async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const user = getUser(req);

  const intervalId = setInterval(async () => {
    try {
      const notifications = await getNotifications(user.id);

      const payload = {
        type: 'alarm',
        data: notifications,
      };

      res.write(`event: alarm\n`);
      res.write(`data: ${JSON.stringify(payload)}\n\n`);
    } catch (err) {
      res.write(`event: error\n`);
      res.write(`data: ${JSON.stringify({ message: 'Failed to fetch notifications' })}\n\n`);
    }
  }, 5000);

  req.on('close', () => {
    clearInterval(intervalId);
    console.log(`SSE connection closed for user ${user.id}`);
  });
};
