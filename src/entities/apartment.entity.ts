import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn, OneToOne } from 'typeorm';
import { User } from './user.entity';
import { NoticeBoard } from './notice-board.entity';
import { ComplaintBoard } from './complaint-board.entity';
import { PollBoard } from './poll-board.entity';

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
}
