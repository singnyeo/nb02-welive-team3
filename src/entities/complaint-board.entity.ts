import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
import { Apartment } from './apartment.entity';
import { Complaint } from './complaint.entity';

// =
// : 민원 게시판
// =

@Entity('complaint_boards')
export class ComplaintBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @OneToMany(() => Complaint, (complaint) => complaint.complaintBoard)
  complaints!: Complaint[];

  @Column()
  apartmentId!: string;

  @OneToOne(() => Apartment, (apartment) => apartment.complaintBoard)
  @JoinColumn({ name: 'apartmentId' })
  apartment!: Apartment;
}
