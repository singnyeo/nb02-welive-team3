import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Apartment } from './apartment.entity';

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum JoinStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
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
  contact!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  email!: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role!: UserRole;

  @Column({
    type: 'enum',
    enum: JoinStatus,
    default: JoinStatus.PENDING,
  })
  joinStatus!: JoinStatus;

  @Column({ default: true })
  isActive!: boolean;

  @Column({ nullable: true })
  apartmentDong!: string;

  @Column({ nullable: true })
  apartmentHo!: string;

  @ManyToOne(() => Apartment, (apartment) => apartment.users, {
    nullable: true,
    onDelete: 'SET NULL',
  })
  apartment!: Apartment;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatarUrl?: string | null;

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
