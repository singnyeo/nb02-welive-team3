import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  JoinColumn,
  OneToOne,
  //OneToMany
} from 'typeorm';
import { Apartment } from './apartment.entity';

// =
// : 공지사항 게시판
// =

@Entity('notice_boards')
export class NoticeBoard {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // @OneToMany(() => Notice, (notice) => notice.noticeBoard)
  // notices!: Notice[];

  @Column()
  apartmentId!: string;

  @OneToOne(() => Apartment, (apartment) => apartment.noticeBoard)
  @JoinColumn({ name: 'apartmentId' })
  apartment!: Apartment;
}
