import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  Index,
} from "typeorm";
import { PollOption } from "./poll-option.entity";
import { User } from "./user.entity";

@Entity("votes")
@Index(["userId", "pollId"], { unique: true }) // 한 투표당 사용자 1회만 투표 가능
export class Vote {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @ManyToOne(() => User, (user) => user.votes)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  userId!: string;

  @ManyToOne(() => PollOption, (option) => option.votes, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "optionId" })
  option!: PollOption;

  @Column()
  optionId!: string;

  @Column()
  pollId!: string; // 중복 투표 방지를 위한 pollId 추가

  @CreateDateColumn()
  createdAt!: Date;
}