import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Unique,
  JoinColumn,
} from "typeorm";
import { User } from "./user.entity";
import { Poll } from "./poll.entity";
import { PollOption } from "./poll-option.entity";

@Entity("votes")
@Unique(["userId", "pollId"])
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

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
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "optionId" })
  option!: PollOption;

  @Column({ type: "uuid" })
  optionId!: string;

  @CreateDateColumn()
  votedAt!: Date;
}
