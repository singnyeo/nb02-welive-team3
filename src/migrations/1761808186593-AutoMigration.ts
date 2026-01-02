import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1761808186593 implements MigrationInterface {
    name = 'AutoMigration1761808186593'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "notice_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentId" uuid NOT NULL, CONSTRAINT "REL_7812a10dbab1120fdaae7df3d9" UNIQUE ("apartmentId"), CONSTRAINT "PK_cba962ec36e1180e1b26ddcacc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notices_category_enum" AS ENUM('MAINTENANCE', 'EMERGENCY', 'COMMUNITY', 'RESIDENT_VOTE', 'RESIDENT_COUNCIL', 'ETC')`);
        await queryRunner.query(`CREATE TABLE "notices" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "boardId" uuid NOT NULL, "category" "public"."notices_category_enum" NOT NULL, "title" text NOT NULL, "isPinned" boolean NOT NULL DEFAULT false, "startDate" TIMESTAMP WITH TIME ZONE, "endDate" TIMESTAMP WITH TIME ZONE, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "content" text NOT NULL, "viewsCount" integer NOT NULL DEFAULT '0', CONSTRAINT "PK_3eb18c29da25d6935fcbe584237" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "comments" ("commentId" uuid NOT NULL DEFAULT uuid_generate_v4(), "content" text NOT NULL, "userId" uuid NOT NULL, "writerName" text NOT NULL, "complaintId" uuid, "noticeId" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "complaint_id" uuid, "notice_id" uuid, CONSTRAINT "PK_b302f2e474ce2a6cbacd7981aa5" PRIMARY KEY ("commentId"))`);
        await queryRunner.query(`CREATE TABLE "user_notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "isChecked" boolean NOT NULL DEFAULT false, "userId" uuid, "notificationId" uuid, CONSTRAINT "PK_569622b0fd6e6ab3661de985a2b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."notifications_type_enum" AS ENUM('GENERAL', 'SIGNUP_REQ', 'COMPLAINT_REQ', 'COMPLAINT_IN_PROGRESS', 'COMPLAINT_RESOLVED', 'COMPLAINT_REJECTED', 'NOTICE_REG', 'POLL_REG', 'POLL_CLOSED', 'POLL_RESULT', 'SYSTEM', 'TEST')`);
        await queryRunner.query(`CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."notifications_type_enum" NOT NULL, "content" character varying NOT NULL, "notifiedAt" TIMESTAMP NOT NULL DEFAULT now(), "complaintId" uuid, "noticeId" character varying, "pollId" uuid, CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."complaints_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED')`);
        await queryRunner.query(`CREATE TABLE "complaints" ("complaintId" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "board_id" uuid, "title" character varying(100) NOT NULL, "content" text NOT NULL, "isPublic" boolean NOT NULL DEFAULT true, "status" "public"."complaints_status_enum" NOT NULL DEFAULT 'PENDING', "viewsCount" integer NOT NULL DEFAULT '0', "dong" character varying, "ho" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_4c63a5a5e335608ea8df33252bb" PRIMARY KEY ("complaintId"))`);
        await queryRunner.query(`CREATE TABLE "complaint_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentId" uuid NOT NULL, CONSTRAINT "REL_5ec872926808d01fc9e54bd5a9" UNIQUE ("apartmentId"), CONSTRAINT "PK_1136eec0ea1ac6623ed979dcf41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "poll_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentId" uuid NOT NULL, CONSTRAINT "REL_85bc6f1fbdd5172942e106f01b" UNIQUE ("apartmentId"), CONSTRAINT "PK_029875f0f93f39f160869748bca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."residents_ishouseholder_enum" AS ENUM('HOUSEHOLDER', 'MEMBER')`);
        await queryRunner.query(`CREATE TYPE "public"."residents_residencestatus_enum" AS ENUM('RESIDENCE', 'NO_RESIDENCE')`);
        await queryRunner.query(`CREATE TABLE "residents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "contact" character varying(20) NOT NULL, "building" character varying(10) NOT NULL, "unitNumber" character varying(10) NOT NULL, "isHouseholder" "public"."residents_ishouseholder_enum" NOT NULL DEFAULT 'MEMBER', "residenceStatus" "public"."residents_residencestatus_enum" NOT NULL DEFAULT 'RESIDENCE', "isRegistered" boolean NOT NULL DEFAULT false, "apartmentId" uuid NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_3b7ff30eaf080e784c2a3492f3" UNIQUE ("userId"), CONSTRAINT "PK_4c8d0413ee0e9a4ebbf500f7365" PRIMARY KEY ("id")); COMMENT ON COLUMN "residents"."name" IS '입주민 이름'; COMMENT ON COLUMN "residents"."contact" IS '연락처'; COMMENT ON COLUMN "residents"."building" IS '동'; COMMENT ON COLUMN "residents"."unitNumber" IS '호수'; COMMENT ON COLUMN "residents"."isHouseholder" IS '세대 여부'; COMMENT ON COLUMN "residents"."residenceStatus" IS '거주 여부'; COMMENT ON COLUMN "residents"."isRegistered" IS '위리브 가입 여부'`);
        await queryRunner.query(`CREATE INDEX "IDX_8fdb25e18fd6f60567a190ae31" ON "residents" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_76663b0dfb9bc282d88f8b6e63" ON "residents" ("contact") `);
        await queryRunner.query(`CREATE INDEX "IDX_8beb11a2fc9db8b5c6b9755f6f" ON "residents" ("building") `);
        await queryRunner.query(`CREATE INDEX "IDX_203994944fd0974433d2354697" ON "residents" ("unitNumber") `);
        await queryRunner.query(`CREATE TYPE "public"."apartments_apartmentstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEED_UPDATE')`);
        await queryRunner.query(`CREATE TABLE "apartments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "officeNumber" character varying NOT NULL, "description" character varying NOT NULL, "startComplexNumber" character varying NOT NULL, "endComplexNumber" character varying NOT NULL, "startDongNumber" character varying NOT NULL, "endDongNumber" character varying NOT NULL, "startFloorNumber" character varying NOT NULL, "endFloorNumber" character varying NOT NULL, "startHoNumber" character varying NOT NULL, "endHoNumber" character varying NOT NULL, "apartmentStatus" "public"."apartments_apartmentstatus_enum" NOT NULL DEFAULT 'PENDING', "adminId" character varying, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, CONSTRAINT "PK_f6058e85d6d715dbe22b72fe722" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_joinstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEED_UPDATE')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "contact" character varying NOT NULL, "avatar" character varying, "isActive" boolean NOT NULL DEFAULT true, "role" "public"."users_role_enum" NOT NULL, "joinStatus" "public"."users_joinstatus_enum" NOT NULL DEFAULT 'PENDING', "residentId" uuid, "apartmentId" uuid, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "deletedAt" TIMESTAMP, "lastLoginAt" TIMESTAMP, "refreshToken" character varying, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_6c71f479b6fd0e0f7e1b8d855e0" UNIQUE ("contact"), CONSTRAINT "REL_a0e2e451cd46b8db454758a81e" UNIQUE ("residentId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."polls_status_enum" AS ENUM('IN_PROGRESS', 'PENDING', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "polls" ("pollId" uuid NOT NULL DEFAULT uuid_generate_v4(), "boardId" character varying NOT NULL, "userId" uuid NOT NULL, "title" character varying NOT NULL, "content" text NOT NULL, "writerName" character varying NOT NULL, "buildingPermission" integer, "startDate" TIMESTAMP NOT NULL, "endDate" TIMESTAMP NOT NULL, "status" "public"."polls_status_enum" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8ad628077b155a33f0512cebe7e" PRIMARY KEY ("pollId"))`);
        await queryRunner.query(`CREATE TABLE "poll_options" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "title" character varying NOT NULL, "voteCount" integer NOT NULL DEFAULT '0', "pollId" uuid NOT NULL, CONSTRAINT "PK_f52aac4865d291e3658dedf9083" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "votes" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "pollId" uuid NOT NULL, "optionId" uuid NOT NULL, "votedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f3d9fd4a0af865152c3f59db8ff" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_e59c5c77879a5ba43d8ee7cf15" ON "votes" ("userId", "pollId") `);
        await queryRunner.query(`ALTER TABLE "notice_boards" ADD CONSTRAINT "FK_7812a10dbab1120fdaae7df3d99" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notices" ADD CONSTRAINT "FK_975d93cdae00324d13838bf3e57" FOREIGN KEY ("boardId") REFERENCES "notice_boards"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_8205c52b0510064812e1359f0ec" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("complaintId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_afa7c54222ad87bbc82d5629f5f" FOREIGN KEY ("notice_id") REFERENCES "notices"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_cb22b968fe41a9f8b219327fde8" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_notifications" ADD CONSTRAINT "FK_01a2c65f414d36cfe6f5d950fb2" FOREIGN KEY ("notificationId") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_a7139b1a43d4be796dc88d9a3e6" FOREIGN KEY ("complaintId") REFERENCES "complaints"("complaintId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notifications" ADD CONSTRAINT "FK_1be08dc3b0a1b3b4bafd469ad83" FOREIGN KEY ("pollId") REFERENCES "polls"("pollId") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_250ea1d40f7a564243d77705e09" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_072f0f3b8a8da70f227d7861095" FOREIGN KEY ("board_id") REFERENCES "complaint_boards"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint_boards" ADD CONSTRAINT "FK_5ec872926808d01fc9e54bd5a9c" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_boards" ADD CONSTRAINT "FK_85bc6f1fbdd5172942e106f01be" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "residents" ADD CONSTRAINT "FK_3b7ff30eaf080e784c2a3492f32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "residents" ADD CONSTRAINT "FK_c27986c3d64e11354652e942846" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_108456969a2cb5d24d7f2541049" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "polls" ADD CONSTRAINT "FK_191293ac413d5830549433eceb2" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_options" ADD CONSTRAINT "FK_4edaafa5d0ea2a447af004706a4" FOREIGN KEY ("pollId") REFERENCES "polls"("pollId") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_5169384e31d0989699a318f3ca4" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_2e40638d2d3b898da1af363837c" FOREIGN KEY ("pollId") REFERENCES "polls"("pollId") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "votes" ADD CONSTRAINT "FK_70b83e1b0a90b9491cfdc73f52d" FOREIGN KEY ("optionId") REFERENCES "poll_options"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_70b83e1b0a90b9491cfdc73f52d"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_2e40638d2d3b898da1af363837c"`);
        await queryRunner.query(`ALTER TABLE "votes" DROP CONSTRAINT "FK_5169384e31d0989699a318f3ca4"`);
        await queryRunner.query(`ALTER TABLE "poll_options" DROP CONSTRAINT "FK_4edaafa5d0ea2a447af004706a4"`);
        await queryRunner.query(`ALTER TABLE "polls" DROP CONSTRAINT "FK_191293ac413d5830549433eceb2"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_108456969a2cb5d24d7f2541049"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3"`);
        await queryRunner.query(`ALTER TABLE "residents" DROP CONSTRAINT "FK_c27986c3d64e11354652e942846"`);
        await queryRunner.query(`ALTER TABLE "residents" DROP CONSTRAINT "FK_3b7ff30eaf080e784c2a3492f32"`);
        await queryRunner.query(`ALTER TABLE "poll_boards" DROP CONSTRAINT "FK_85bc6f1fbdd5172942e106f01be"`);
        await queryRunner.query(`ALTER TABLE "complaint_boards" DROP CONSTRAINT "FK_5ec872926808d01fc9e54bd5a9c"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_072f0f3b8a8da70f227d7861095"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_250ea1d40f7a564243d77705e09"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_1be08dc3b0a1b3b4bafd469ad83"`);
        await queryRunner.query(`ALTER TABLE "notifications" DROP CONSTRAINT "FK_a7139b1a43d4be796dc88d9a3e6"`);
        await queryRunner.query(`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_01a2c65f414d36cfe6f5d950fb2"`);
        await queryRunner.query(`ALTER TABLE "user_notifications" DROP CONSTRAINT "FK_cb22b968fe41a9f8b219327fde8"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_afa7c54222ad87bbc82d5629f5f"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_8205c52b0510064812e1359f0ec"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_4c675567d2a58f0b07cef09c13d"`);
        await queryRunner.query(`ALTER TABLE "notices" DROP CONSTRAINT "FK_975d93cdae00324d13838bf3e57"`);
        await queryRunner.query(`ALTER TABLE "notice_boards" DROP CONSTRAINT "FK_7812a10dbab1120fdaae7df3d99"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e59c5c77879a5ba43d8ee7cf15"`);
        await queryRunner.query(`DROP TABLE "votes"`);
        await queryRunner.query(`DROP TABLE "poll_options"`);
        await queryRunner.query(`DROP TABLE "polls"`);
        await queryRunner.query(`DROP TYPE "public"."polls_status_enum"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_joinstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "apartments"`);
        await queryRunner.query(`DROP TYPE "public"."apartments_apartmentstatus_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_203994944fd0974433d2354697"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8beb11a2fc9db8b5c6b9755f6f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76663b0dfb9bc282d88f8b6e63"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fdb25e18fd6f60567a190ae31"`);
        await queryRunner.query(`DROP TABLE "residents"`);
        await queryRunner.query(`DROP TYPE "public"."residents_residencestatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."residents_ishouseholder_enum"`);
        await queryRunner.query(`DROP TABLE "poll_boards"`);
        await queryRunner.query(`DROP TABLE "complaint_boards"`);
        await queryRunner.query(`DROP TABLE "complaints"`);
        await queryRunner.query(`DROP TYPE "public"."complaints_status_enum"`);
        await queryRunner.query(`DROP TABLE "notifications"`);
        await queryRunner.query(`DROP TYPE "public"."notifications_type_enum"`);
        await queryRunner.query(`DROP TABLE "user_notifications"`);
        await queryRunner.query(`DROP TABLE "comments"`);
        await queryRunner.query(`DROP TABLE "notices"`);
        await queryRunner.query(`DROP TYPE "public"."notices_category_enum"`);
        await queryRunner.query(`DROP TABLE "notice_boards"`);
    }

}
