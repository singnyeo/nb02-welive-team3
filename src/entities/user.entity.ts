import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { Apartment } from './apartment.entity';
import { Resident } from './resident.entity';
import { Complaint } from './complaint.entity';
import { Vote } from './vote.entity';
import { Poll } from './poll.entity';
import { UserNotification } from './user-notification.entity';

// =
// : 사용자
// =

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum JoinStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  NEED_UPDATE = 'NEED_UPDATE',
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

<<<<<<< HEAD
  @Column({ unique: true })
=======
  @Column()
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
  contact!: string;

  @Column({ nullable: true })
  avatar?: string;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ type: 'enum', enum: UserRole })
  role!: UserRole;

  @Column({ type: 'enum', enum: JoinStatus, default: JoinStatus.PENDING })
  joinStatus!: JoinStatus;

  @OneToOne(() => Resident, (resident) => resident.user, { nullable: true })
  @JoinColumn({ name: 'residentId' })
  resident?: Resident;

  @Column({ nullable: true })
  residentId?: string;

  @ManyToOne(() => Apartment, (apartment) => apartment.users, { nullable: true })
  @JoinColumn({ name: 'apartmentId' })
  apartment?: Apartment;

<<<<<<< HEAD
  @Column()
<<<<<<< HEAD
=======
  @Column({ nullable: true })
>>>>>>> 7eee585 (feat: 아파트 API 기능 추가)
  apartmentId?: string;

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints!: Complaint[];

  @OneToMany(() => Notice, (notice) => notice.user)
  notices!: Notice[];

  @OneToMany(() => Poll, (poll) => poll.user)
  polls!: Poll[];

  @OneToMany(() => Vote, (vote) => vote.user)
  votes!: Vote[];

<<<<<<< HEAD
<<<<<<< HEAD
  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];
=======
  apartmentId!: string;
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
=======
  //   @OneToMany(() => Comment, (comment) => comment.user)
  //   comments!: Comment[];

  @OneToMany(() => UserNotification, (userNotification) => userNotification.user)
  userNotifications!: UserNotification[];
>>>>>>> 7eee585 (feat: 아파트 API 기능 추가)

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints!: Complaint[];

<<<<<<< HEAD
  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  @Column({ nullable: true })
  refreshToken?: string;
=======
  @OneToMany(() => Notice, (notice) => notice.user)
  notices!: Notice[];

  @OneToMany(() => Poll, (poll) => poll.user)
  polls!: Poll[];

  @OneToMany(() => Comment, (comment) => comment.user)
  comments!: Comment[];
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
=======
  // @OneToMany(() => Comment, (comment) => comment.user)
  // comments!: Comment[];
>>>>>>> b9332bc (fix: 정의 되지 않은 관계성 임의 주석 처리)
}
