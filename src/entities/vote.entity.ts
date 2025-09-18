import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
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
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Poll } from "./poll.entity";
import { PollOption } from "./poll-option.entity";

@Entity("votes")
@Unique(["userId", "pollId"])
>>>>>>> 48e5c91 (feat: vote 엔티티 작성)
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @ManyToOne(() => Poll)
  @JoinColumn({ name: "pollId" })
  poll!: Poll;

  @Column({ type: "uuid" })
  pollId!: string;

  @ManyToOne(() => PollOption, (option: PollOption) => option.voteRecords, {
>>>>>>> 48e5c91 (feat: vote 엔티티 작성)
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "optionId" })
  option!: PollOption;

<<<<<<< HEAD
  @Column()
  optionId!: string;

  @Column()
  pollId!: string; // 중복 투표 방지를 위한 pollId 추가

  @CreateDateColumn()
  createdAt!: Date;
=======
  @Column({ type: "uuid" })
  optionId!: string;

  @CreateDateColumn()
  votedAt!: Date;
>>>>>>> 48e5c91 (feat: vote 엔티티 작성)
}
