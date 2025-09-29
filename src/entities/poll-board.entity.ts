import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { Apartment } from './apartment.entity';

// =
// : 주민투표 게시판
// =

@Entity('poll_boards')
export class PollBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

<<<<<<< HEAD
  // @OneToMany(() => Poll, (poll) => poll.pollBoard)
  // polls!: Poll[];
=======
  @OneToMany(() => Poll, (poll) => poll.pollBoard)
  polls!: Poll[];
>>>>>>> a95cb38 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)

  @Column()
  apartmentId!: string;

  @OneToOne(() => Apartment, (apartment) => apartment.pollBoard)
  @JoinColumn({ name: 'apartmentId' })
  apartment!: Apartment;
}
