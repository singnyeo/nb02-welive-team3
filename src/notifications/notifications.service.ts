import { AppDataSource } from '../config/data-source';
import { UserNotification } from '../entities/user-notification.entity';

const userNotificationRepository = AppDataSource.getRepository(UserNotification);

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
