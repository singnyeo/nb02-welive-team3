import { AppDataSource } from '../config/data-source';
import { Notification, NotificationType } from '../entities/notification.entity';
import { UserNotification } from '../entities/user-notification.entity';
import { sendNotificationToUser } from './notifications.controller';

const userNotificationRepository = AppDataSource.getRepository(UserNotification);
const notificationRepository = AppDataSource.getRepository(Notification);

export const getNotifications = async (userId: string) => {
  const userNotifications = await userNotificationRepository.find({
    where: { user: { id: userId }, isChecked: false },
    relations: ['notification'],
    order: { notification: { notifiedAt: 'DESC' } },
  });

  return userNotifications.map((un: UserNotification) => ({
    notificationId: un.notification.id,
    content: un.notification.content,
    notificationType: un.notification.type,
    notifiedAt: un.notification.notifiedAt.toISOString(),
    isChecked: un.isChecked,
    complaintId: un.notification.complaintId,
    noticeId: un.notification.noticeId,
    pollId: un.notification.pollId,
  }));
};

export const createNotification = async (
  userIds: string[],
  content: string,
  type: NotificationType,
  complaintId?: string,
  noticeId?: string,
  pollId?: string
) => {
  const newNotification = notificationRepository.create({
    content,
    type,
    complaintId,
    noticeId,
    pollId,
  });

  await notificationRepository.save(newNotification);

  for (const userId of userIds) {
    const userNotification = userNotificationRepository.create({
      user: { id: userId },
      notification: newNotification,
      isChecked: false,
    });

    await userNotificationRepository.save(userNotification);

    sendNotificationToUser(userId, {
      type: 'alarm',
      data: [
        {
          notificationId: newNotification.id,
          content: newNotification.content,
          notificationType: newNotification.type,
          notifiedAt: newNotification.notifiedAt.toISOString(),
          isChecked: false,
          complaintId,
          noticeId,
          pollId,
        },
      ],
    });
  }

  return newNotification;
};

export const markNotificationAsRead = async (userId: string, notificationId: string) => {
  const userNotification = await userNotificationRepository.findOne({
    where: { user: { id: userId }, notification: { id: notificationId } },
    relations: ['notification'],
  });

  if (!userNotification) {
    throw new Error('Notification not found for this user');
  }

  userNotification.isChecked = true;
  await userNotificationRepository.save(userNotification);
};
