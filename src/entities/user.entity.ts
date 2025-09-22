import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, OneToOne } from 'typeorm';
import { Apartment } from './apartment.entity';
import { Resident } from './resident.entity';
import { Complaint } from './complaint.entity';

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

  @Column()
  email!: string;

  @Column()
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

  @Column()
  apartmentId!: string;

  @OneToMany(() => Complaint, (complaint) => complaint.user)
  complaints!: Complaint[];

  // @OneToMany(() => Notice, (notice) => notice.user)
  // notices!: Notice[];

  // @OneToMany(() => Poll, (poll) => poll.user)
  // polls!: Poll[];

  // @OneToMany(() => Vote, (vote) => vote.user)
  // votes!: Vote[];

  // @OneToMany(() => Comment, (comment) => comment.user)
  // comments!: Comment[];
