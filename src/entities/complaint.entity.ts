import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { Comment } from "./comment.entity";
import { User } from "./user.entity";

export type ComplaintStatus = "PENDING" | "IN_PROGRESS" | "RESOLVED";

@Entity({ name: "complaints" })
export class Complaint {
  @PrimaryGeneratedColumn("uuid")
  complaintId!: string;

  @ManyToOne(() => User, (user) => user.complaints, { onDelete: "CASCADE" })
  @JoinColumn({ name: "user_id" })
  user!: User;

  @Column({ type: "uuid" })
  userId!: string;

  @Column({ length: 100 })
  title!: string;

  @Column({ type: "text" })
  content!: string;

  @Column({ default: true })
  isPublic!: boolean;

  @Column({ type: "uuid", nullable: true })
  boardId!: string | null;

  @Column({
    type: "enum",
    enum: ["PENDING", "IN_PROGRESS", "RESOLVED"],
    default: "PENDING",
  })
  status!: ComplaintStatus;

  @Column({ default: 0 })
  viewsCount!: number;

  @Column({ default: 0 })
  commentsCount!: number;

  @Column({ nullable: true })
  dong!: string;

  @Column({ nullable: true })
  ho!: string;

  @OneToMany(() => Comment, (comment) => comment.complaint)
  comments!: Comment[];

  @CreateDateColumn({ name: "created_at" })
  createdAt!: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt!: Date;
}
