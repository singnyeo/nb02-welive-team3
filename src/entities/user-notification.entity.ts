import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { Notification } from './notification.entity';

@Entity('user_notifications')
export class UserNotification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => User, (user) => user.userNotifications, { onDelete: 'CASCADE' })
  user!: User;

  @ManyToOne(() => Notification, (notification) => notification.userNotifications, { onDelete: 'CASCADE' })
  notification!: Notification;

  @Column({ default: false })
  isChecked!: boolean;
}
