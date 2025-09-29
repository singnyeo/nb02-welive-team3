import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { UserNotification } from './user-notification.entity';
import { Complaint } from './complaint.entity';
import { Poll } from './poll.entity';

export enum NotificationType {
  GENERAL = 'GENERAL',
  SIGNUP_REQ = 'SIGNUP_REQ',
  COMPLAINT_REQ = 'COMPLAINT_REQ',
  COMPLAINT_IN_PROGRESS = 'COMPLAINT_IN_PROGRESS',
  COMPLAINT_RESOLVED = 'COMPLAINT_RESOLVED',
  COMPLAINT_REJECTED = 'COMPLAINT_REJECTED',
  NOTICE_REG = 'NOTICE_REG',
  POLL_REG = 'POLL_REG',
  POLL_CLOSED = 'POLL_CLOSED',
  POLL_RESULT = 'POLL_RESULT',
  SYSTEM = 'SYSTEM',
  TEST = 'TEST',
}

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'enum', enum: NotificationType })
  type!: NotificationType;

  @Column()
  content!: string;

  @CreateDateColumn()
  notifiedAt!: Date;

  @Column({ nullable: true })
  complaintId?: string;

  @ManyToOne(() => Complaint, (complaint) => complaint.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'complaintId' })
  complaint?: Complaint;

  @Column({ nullable: true })
  noticeId?: string;

  /* @ManyToOne(() => Notice, (notice) => notice.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'noticeId' })
  notice?: Notice; */

  @Column({ nullable: true })
  pollId?: string;

  @ManyToOne(() => Poll, (poll) => poll.notifications, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'pollId' })
  poll?: Poll;

  @OneToMany(() => UserNotification, (userNotification) => userNotification.notification)
  userNotifications!: UserNotification[];
}
