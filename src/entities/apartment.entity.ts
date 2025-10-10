import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { User } from './user.entity';
import { NoticeBoard } from './notice-board.entity';
import { ComplaintBoard } from './complaint-board.entity';
import { PollBoard } from './poll-board.entity';
import { Resident } from './resident.entity';
import { ApprovalStatus } from './approvalStatus.entity';

// =
// : 아파트
// =

@Entity('apartments')
export class Apartment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column()
  officeNumber!: string;

  @Column()
  description!: string;

  @Column()
  startComplexNumber!: string;

  @Column()
  endComplexNumber!: string;

  @Column()
  startDongNumber!: string;

  @Column()
  endDongNumber!: string;

  @Column()
  startFloorNumber!: string;

  @Column()
  endFloorNumber!: string;

  @Column()
  startHoNumber!: string;

  @Column()
  endHoNumber!: string;

  @Column({
    type: 'enum',
    enum: ApprovalStatus,
    default: ApprovalStatus.PENDING,
  })
  apartmentStatus!: ApprovalStatus;

  @OneToMany(() => User, (user) => user.apartment)
  users!: User[];

  // 아파트 관리자는 한 명으로 추측
  // @OneToMany(() => User, (user) => user.apartment)
  // admins!: User[];

  @Column({ nullable: true })
  adminId?: string;

  @OneToOne(() => NoticeBoard, (noticeBoard) => noticeBoard.apartment)
  noticeBoard!: NoticeBoard;

  @OneToOne(() => ComplaintBoard, (complaintBoard) => complaintBoard.apartment)
  complaintBoard!: ComplaintBoard;

  @OneToOne(() => PollBoard, (pollBoard) => pollBoard.apartment)
  pollBoard!: PollBoard;

  @OneToMany(() => Resident, (resident) => resident.apartment)
  residents!: Resident[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;
}
