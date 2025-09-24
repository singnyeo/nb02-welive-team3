import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PollOption } from './poll-option.entity';
import { User } from './user.entity';
import { Notification } from './notification.entity';

@Entity('polls')
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  pollId!: string;

  @Column()
  boardId!: string;

  @ManyToOne(() => User, (user) => user.polls)
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  userId!: string;

  @Column()
  title!: string;

  @Column('text')
  content!: string;

  @Column()
  writerName!: string;

  @Column({ nullable: true })
  buildingPermission?: string;

  @Column('timestamp')
  startDate!: Date;

  @Column('timestamp')
  endDate!: Date;

  @Column({
    type: 'enum',
    enum: ['IN_PROGRESS', 'PENDING', 'COMPLETED'],
    default: 'PENDING',
  })
  status!: 'IN_PROGRESS' | 'PENDING' | 'COMPLETED';

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options!: PollOption[];
  pollBoard: any;

  @OneToMany(() => Notification, (notification) => notification.poll)
  notifications!: Notification[];
}
