import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { ComplaintBoard } from './complaint-board.entity';
import { Comment } from './comment.entity';
import { Notification } from './notification.entity';

export type ComplaintStatus = 'PENDING' | 'IN_PROGRESS' | 'RESOLVED';

@Entity({ name: 'complaints' })
export class Complaint {
  @PrimaryGeneratedColumn('uuid')
  complaintId!: string;

  @ManyToOne(() => User, (user) => user.complaints, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Column({ type: 'uuid' })
  userId!: string;

  @ManyToOne(() => ComplaintBoard, (board) => board.complaints, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @JoinColumn({ name: 'board_id' })
  complaintBoard!: ComplaintBoard | null;

  @Column({ type: 'uuid', nullable: true })
  boardId!: string | null;

  @ManyToOne(() => ComplaintBoard, (board) => board.complaints, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  @Column({ length: 100 })
  title!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ default: true })
  isPublic!: boolean;

  @Column({
    type: 'enum',
    enum: ['PENDING', 'IN_PROGRESS', 'RESOLVED'],
    default: 'PENDING',
  })
  status!: ComplaintStatus;

  @Column({ default: 0 })
  viewsCount!: number;

  @Column({ default: 0 })
  commentsCount!: number;

  @Column({ nullable: true })
  dong!: string;

  @Column({ nullable: true })
  ho!: string;

  @OneToMany(() => Comment, (comment) => comment.complaint)
  comments!: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @OneToMany(() => Notification, (notification) => notification.complaint)
  notifications!: Notification[];
}
