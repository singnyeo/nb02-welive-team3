import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Apartment } from './apartment.entity';

// =
// : 주민투표 게시판
// =

@Entity('poll_boards')
export class PollBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @OneToMany(() => Poll, (poll) => poll.pollBoard)
  // polls!: Poll[];

  @Column()
  apartmentId!: string;

  @OneToOne(() => Apartment, (apartment) => apartment.pollBoard)
  @JoinColumn({ name: 'apartmentId' })
  apartment!: Apartment;
}
