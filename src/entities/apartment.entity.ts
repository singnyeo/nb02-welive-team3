import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from './user.entity';

@Entity('apartments')
export class Apartment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  apartmentName!: string;

  @Column()
  apartmentAddress!: string;

  @Column({ unique: true })
  apartmentManagementNumber!: string;

  @Column({ nullable: true })
  description!: string;

  @Column({ nullable: true })
  startComplexNumber!: string;

  @Column({ nullable: true })
  endComplexNumber!: string;

  @Column({ nullable: true })
  startDongNumber!: string;

  @Column({ nullable: true })
  endDongNumber!: string;

  @Column({ nullable: true })
  startFloorNumber!: string;

  @Column({ nullable: true })
  endFloorNumber!: string;

  @Column({ nullable: true })
  startHoNumber!: string;

  @Column({ nullable: true })
  endHoNumber!: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  imageUrl?: string | null;

  @OneToMany(() => User, (user) => user.apartment)
  users!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
