import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
<<<<<<< HEAD
<<<<<<< HEAD
  JoinColumn,
  Index,
} from "typeorm";
import { PollOption } from "./poll-option.entity";
import { User } from "./user.entity";

@Entity("votes")
@Index(["userId", "pollId"], { unique: true }) // 한 투표당 사용자 1회만 투표 가능
=======
  Unique,
=======
>>>>>>> f01fce7 (fix: API 명세서 수정본대로 수정)
  JoinColumn,
  Index,
} from "typeorm";
import { PollOption } from "./poll-option.entity";
import { User } from "./user.entity";

@Entity("votes")
<<<<<<< HEAD
@Unique(["userId", "pollId"])
>>>>>>> 48e5c91 (feat: vote 엔티티 작성)
=======
@Index(["userId", "pollId"], { unique: true }) // 한 투표당 사용자 1회만 투표 가능
>>>>>>> f01fce7 (fix: API 명세서 수정본대로 수정)
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

<<<<<<< HEAD
<<<<<<< HEAD
  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => PollOption, (option) => option.votes, {
=======
  @ManyToOne(() => User)
  @JoinColumn({ name: "userId" }) // 여기서 userId는 입주민 ID
=======
  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: "userId" })
>>>>>>> f01fce7 (fix: API 명세서 수정본대로 수정)
  user!: User;

  @Column()
  userId!: string;

<<<<<<< HEAD
  @ManyToOne(() => Poll)
  @JoinColumn({ name: "pollId" })
  poll!: Poll;

  @Column({ type: "uuid" })
  pollId!: string;

  @ManyToOne(() => PollOption, (option: PollOption) => option.voteRecords, {
>>>>>>> 48e5c91 (feat: vote 엔티티 작성)
=======
  @ManyToOne(() => PollOption, (option) => option.votes, {
>>>>>>> f01fce7 (fix: API 명세서 수정본대로 수정)
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "optionId" })
  option!: PollOption;

<<<<<<< HEAD
<<<<<<< HEAD
  @Column()
  optionId!: string;

  @Column()
  pollId!: string; // 중복 투표 방지를 위한 pollId 추가

  @CreateDateColumn()
  createdAt!: Date;
=======
  @Column({ type: "uuid" })
=======
  @Column()
>>>>>>> f01fce7 (fix: API 명세서 수정본대로 수정)
  optionId!: string;

  @Column()
  pollId!: string; // 중복 투표 방지를 위한 pollId 추가

  @CreateDateColumn()
<<<<<<< HEAD
  votedAt!: Date;
>>>>>>> 48e5c91 (feat: vote 엔티티 작성)
=======
  createdAt!: Date;
>>>>>>> f01fce7 (fix: API 명세서 수정본대로 수정)
}
