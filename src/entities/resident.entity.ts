import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  DeleteDateColumn
} from "typeorm";
import { User } from "./user.entity";
import { Apartment } from "./apartment.entity";

export enum ResidentStatus {
  RESIDENCE = 'RESIDENCE',
  NO_RESIDENCE = 'NO_RESIDENCE',
}

export enum HouseholdType {
  HOUSEHOLDER = 'HOUSEHOLDER',
  MEMBER = 'MEMBER',
}

@Entity('Resident')
export class Resident {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ length: 50, nullable: false, comment: '입주민 이름' })
  name!: string;

  @Index()
  @Column({ length: 20, nullable: false, comment: '연락처' })
  contact!: string;

  @Index()
  @Column({ length: 10, nullable: false, comment: '동' })
  building!: string;

  @Index()
  @Column({ length: 10, nullable: false, comment: '호수' })
  unitNumber!: string;

  @Column({
    type: 'enum',
    enum: HouseholdType,
    default: HouseholdType.MEMBER,
    nullable: false,
    comment: '세대 여부',
  })
  isHouseholder!: HouseholdType;

  @Column({
    type: 'enum',
    enum: ResidentStatus,
    default: ResidentStatus.RESIDENCE,
    nullable: false,
    comment: '거주 여부',
  })
  residentStatus!: ResidentStatus;

  @Column({ default: false, comment: '위리브 가입 여부' })
  isRegistered!: boolean;

  @OneToOne(() => User, user => user.resident, {
    cascade: true,
    nullable: true,
    onDelete: 'CASCADE',
  })

  @JoinColumn()
  user?: User | null;

  @ManyToOne(() => Apartment, apartment => apartment.residents, {
    onDelete: 'CASCADE',
    nullable: false,
  })

  @JoinColumn({ name: 'apartmentId' })
  apartment!: Apartment;

  @Column()
  apartmentId!: string;

  @DeleteDateColumn({ nullable: true })
  deletedAt?: Date;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
