<<<<<<< HEAD
import { 
  Entity, 
  PrimaryGeneratedColumn, 
  Column, 
  JoinColumn, 
  OneToOne, 
  //OneToMany 
  } from 'typeorm';
=======
import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, OneToOne, OneToMany } from 'typeorm';
>>>>>>> a95cb38 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)
import { Apartment } from './apartment.entity';

// =
// : 공지사항 게시판
// =

@Entity('notice_boards')
export class NoticeBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

<<<<<<< HEAD
  // @OneToMany(() => Notice, (notice) => notice.noticeBoard)
  // notices!: Notice[];
=======
  @OneToMany(() => Notice, (notice) => notice.noticeBoard)
  notices!: Notice[];
>>>>>>> a95cb38 (feat: User,Apartment,PollBoard,NoticeBoard,ComplaintBoard 엔티티 초안 작성)

  @Column()
  apartmentId!: string;

  @OneToOne(() => Apartment, (apartment) => apartment.noticeBoard)
  @JoinColumn({ name: 'apartmentId' })
  apartment!: Apartment;
}
