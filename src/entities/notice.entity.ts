import { Entity, PrimaryGeneratedColumn, Column, JoinColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, OneToMany, Index } from 'typeorm';
import { User } from './user.entity';
//import { Apartment } from './apartment.entity';
// import { Comment } from "../entities/comment.entity";

// =
// : 공지사항 게시판
// =
export enum NoticeCategory {
    MAINTENANCE = 'MAINTENANCE',
    EMERGENCY = 'EMERGENCY',
    COMMUNITY = 'COMMUNITY',
    RESIDENT_VOTE = 'RESIDENT_VOTE',
    RESIDENT_COUNCIL = 'RESIDENT_COUNCIL',
    ETC = 'ETC',
}

@Entity('notice_boards')
export class NoticeBoard {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    boardId!: string;

    @Column({ type: 'enum', enum: NoticeCategory, nullable: false })
    category!: NoticeCategory;

    @Column({ type: 'text', nullable: false })
    title!: string;

    @ManyToOne(() => NoticeBoard, { onDelete: 'RESTRICT' })
    @JoinColumn({ name: 'boardId' })
    board!: NoticeBoard;

    // 고정 먼저 → 최신순 정렬을 위한 키
    @Column({ type: 'boolean', default: false })
    isPinned!: boolean;

    // 일정 공지용(선택)
    @Column({ type: 'timestamptz', nullable: true })
    startDate?: Date;

    @Column({ type: 'timestamptz', nullable: true })
    endDate?: Date;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ type: 'timestamptz' })
    updatedAt!: Date;

    @Column({ type: 'text', nullable: false })
    content!: string;
}

// =
// : 공지사항 댓글 
// =
@Entity('notices')
export class Notice {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToMany(() => Comment, (c) => c.notice)
    comments!: Comment[];
}

@Entity('comments')
export class Comment {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'text', nullable: false })
    content!: string;

    @Column({ type: 'uuid', nullable: false })
    noticeId!: string;

    @ManyToOne(() => Notice, (notice) => notice.comments, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'noticeId' })
    notice!: Notice;
}

// =
// : 공지사항 알림
// =
export enum NotificationType {
    NOTICE_CREATED = 'NOTICE_CREATED',
    COMMENT_CREATED = 'COMMENT_CREATED',
}

export enum NotificationSource {
    NOTICE = 'NOTICE',
    COMMENT = 'COMMENT',
}

@Entity('notifications')
@Index(['receiverId', 'isRead', 'createdAt'])
export class Notification {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Column({ type: 'uuid', nullable: false })
    receiverId!: string;

    @ManyToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'receiverId' })
    receiver!: User;

    @Column({ type: 'enum', enum: NotificationType, nullable: false })
    type!: NotificationType;

    @Column({ type: 'enum', enum: NotificationSource, nullable: false })
    sourceType!: NotificationSource;

    @Column({ type: 'uuid', nullable: false })
    sourceId!: string; // noticeId or commentId

    @Column({ type: 'text', nullable: true })
    message?: string;

    @Column({ type: 'boolean', default: false })
    isRead!: boolean;

    @CreateDateColumn({ type: 'timestamptz' })
    createdAt!: Date;

}