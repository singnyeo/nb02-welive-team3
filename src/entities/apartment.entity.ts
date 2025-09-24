<<<<<<< HEAD
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
=======
import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
import { User } from './user.entity';
import { NoticeBoard } from './notice-board.entity';
import { ComplaintBoard } from './complaint-board.entity';
import { PollBoard } from './poll-board.entity';
<<<<<<< HEAD
import { Resident } from './resident.entity';
=======
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)

// =
// : 아파트
// =

export enum ApartmentStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

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
    enum: ApartmentStatus,
    default: ApartmentStatus.PENDING,
  })
  apartmentStatus!: ApartmentStatus;

  @OneToMany(() => User, (user) => user.apartment)
  users!: User[];

<<<<<<< HEAD
<<<<<<< HEAD
  @OneToMany(() => User, (user) => user.apartment)
  admins!: User[];
=======
  // 아파트 관리자는 한 명으로 추측
  // @OneToMany(() => User, (user) => user.apartment)
  // admins!: User[];

  @Column()
  adminId!: string;
>>>>>>> 7eee585 (feat: 아파트 API 기능 추가)

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
=======
  @ManyToOne(() => User)
  @JoinColumn({ name: 'adminId' })
  admin!: User;

  @Column()
  adminId!: string;

  @OneToOne(() => NoticeBoard, (noticeBoard) => noticeBoard.apartment)
  noticeBoard!: NoticeBoard;

  @OneToOne(() => ComplaintBoard, (complaintBoard) => complaintBoard.apartment)
  complaintBoard!: ComplaintBoard;

  @OneToOne(() => PollBoard, (pollBoard) => pollBoard.apartment)
  pollBoard!: PollBoard;
>>>>>>> 5a8d463 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
}
