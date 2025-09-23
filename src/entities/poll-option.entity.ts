import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from "typeorm";
import { Poll } from "./poll.entity";
import { Vote } from "./vote.entity";

@Entity("poll_options")
export class PollOption {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  title!: string;

  @Column({ default: 0 })
  voteCount!: number;

  @ManyToOne(() => Poll, (poll) => poll.options, { onDelete: "CASCADE" })
  @JoinColumn({ name: "pollId" })
  poll!: Poll;

  @Column()
  pollId!: string;

  @OneToMany(() => Vote, (vote) => vote.option)
  votes!: Vote[];
}
