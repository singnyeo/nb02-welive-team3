import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1758521032312 implements MigrationInterface {
    name = 'AutoMigration1758521032312'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."Resident_ishouseholder_enum" AS ENUM('HOUSEHOLDER', 'MEMBER')`);
        await queryRunner.query(`CREATE TYPE "public"."Resident_residentstatus_enum" AS ENUM('RESIDENCE', 'NO_RESIDENCE')`);
        await queryRunner.query(`CREATE TABLE "Resident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "contact" character varying(20) NOT NULL, "building" character varying(10) NOT NULL, "unitNumber" character varying(10) NOT NULL, "isHouseholder" "public"."Resident_ishouseholder_enum" NOT NULL DEFAULT 'MEMBER', "residentStatus" "public"."Resident_residentstatus_enum" NOT NULL DEFAULT 'RESIDENCE', "isRegistered" boolean NOT NULL DEFAULT false, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_c514bcce193de43809a400af8c" UNIQUE ("userId"), CONSTRAINT "PK_448f54794409b6e623b3c8a775e" PRIMARY KEY ("id")); COMMENT ON COLUMN "Resident"."name" IS '입주민 이름'; COMMENT ON COLUMN "Resident"."contact" IS '연락처'; COMMENT ON COLUMN "Resident"."building" IS '동'; COMMENT ON COLUMN "Resident"."unitNumber" IS '호수'; COMMENT ON COLUMN "Resident"."isHouseholder" IS '세대 여부'; COMMENT ON COLUMN "Resident"."residentStatus" IS '거주 여부'; COMMENT ON COLUMN "Resident"."isRegistered" IS '위리브 가입 여부'`);
        await queryRunner.query(`CREATE INDEX "IDX_3783ac9e14171d77147ea24c84" ON "Resident" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_0031643723c2c51db64d8ef655" ON "Resident" ("contact") `);
        await queryRunner.query(`CREATE INDEX "IDX_8b3189e4e295616057179dcacf" ON "Resident" ("building") `);
        await queryRunner.query(`CREATE INDEX "IDX_c50ffb94014d69490fef128b5e" ON "Resident" ("unitNumber") `);
        await queryRunner.query(`CREATE TYPE "public"."complaints_status_enum" AS ENUM('PENDING', 'IN_PROGRESS', 'RESOLVED')`);
        await queryRunner.query(`CREATE TABLE "complaints" ("complaintId" uuid NOT NULL DEFAULT uuid_generate_v4(), "userId" uuid NOT NULL, "boardId" uuid, "title" character varying(100) NOT NULL, "content" text NOT NULL, "isPublic" boolean NOT NULL DEFAULT true, "status" "public"."complaints_status_enum" NOT NULL DEFAULT 'PENDING', "viewsCount" integer NOT NULL DEFAULT '0', "commentsCount" integer NOT NULL DEFAULT '0', "dong" character varying, "ho" character varying, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "user_id" uuid, "board_id" uuid, CONSTRAINT "PK_4c63a5a5e335608ea8df33252bb" PRIMARY KEY ("complaintId"))`);
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_joinstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED', 'NEED_UPDATE')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "contact" character varying NOT NULL, "avatar" character varying, "isActive" boolean NOT NULL DEFAULT true, "role" "public"."users_role_enum" NOT NULL, "joinStatus" "public"."users_joinstatus_enum" NOT NULL DEFAULT 'PENDING', "residentId" uuid, "apartmentId" uuid NOT NULL, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "REL_a0e2e451cd46b8db454758a81e" UNIQUE ("residentId"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "notice_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentId" uuid NOT NULL, CONSTRAINT "REL_7812a10dbab1120fdaae7df3d9" UNIQUE ("apartmentId"), CONSTRAINT "PK_cba962ec36e1180e1b26ddcacc9" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "poll_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentId" uuid NOT NULL, CONSTRAINT "REL_85bc6f1fbdd5172942e106f01b" UNIQUE ("apartmentId"), CONSTRAINT "PK_029875f0f93f39f160869748bca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."apartments_apartmentstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "apartments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying NOT NULL, "address" character varying NOT NULL, "officeNumber" character varying NOT NULL, "description" character varying NOT NULL, "startComplexNumber" character varying NOT NULL, "endComplexNumber" character varying NOT NULL, "startDongNumber" character varying NOT NULL, "endDongNumber" character varying NOT NULL, "startFloorNumber" character varying NOT NULL, "endFloorNumber" character varying NOT NULL, "startHoNumber" character varying NOT NULL, "endHoNumber" character varying NOT NULL, "apartmentStatus" "public"."apartments_apartmentstatus_enum" NOT NULL DEFAULT 'PENDING', "adminId" uuid NOT NULL, CONSTRAINT "PK_f6058e85d6d715dbe22b72fe722" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "complaint_boards" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentId" uuid NOT NULL, CONSTRAINT "REL_5ec872926808d01fc9e54bd5a9" UNIQUE ("apartmentId"), CONSTRAINT "PK_1136eec0ea1ac6623ed979dcf41" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "Resident" ADD CONSTRAINT "FK_c514bcce193de43809a400af8cc" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_250ea1d40f7a564243d77705e09" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_072f0f3b8a8da70f227d7861095" FOREIGN KEY ("board_id") REFERENCES "complaint_boards"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_108456969a2cb5d24d7f2541049" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "notice_boards" ADD CONSTRAINT "FK_7812a10dbab1120fdaae7df3d99" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "poll_boards" ADD CONSTRAINT "FK_85bc6f1fbdd5172942e106f01be" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "apartments" ADD CONSTRAINT "FK_38d758995adb8ceb00c8b761e43" FOREIGN KEY ("adminId") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "complaint_boards" ADD CONSTRAINT "FK_5ec872926808d01fc9e54bd5a9c" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaint_boards" DROP CONSTRAINT "FK_5ec872926808d01fc9e54bd5a9c"`);
        await queryRunner.query(`ALTER TABLE "apartments" DROP CONSTRAINT "FK_38d758995adb8ceb00c8b761e43"`);
        await queryRunner.query(`ALTER TABLE "poll_boards" DROP CONSTRAINT "FK_85bc6f1fbdd5172942e106f01be"`);
        await queryRunner.query(`ALTER TABLE "notice_boards" DROP CONSTRAINT "FK_7812a10dbab1120fdaae7df3d99"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_108456969a2cb5d24d7f2541049"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_072f0f3b8a8da70f227d7861095"`);
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_250ea1d40f7a564243d77705e09"`);
        await queryRunner.query(`ALTER TABLE "Resident" DROP CONSTRAINT "FK_c514bcce193de43809a400af8cc"`);
        await queryRunner.query(`DROP TABLE "complaint_boards"`);
        await queryRunner.query(`DROP TABLE "apartments"`);
        await queryRunner.query(`DROP TYPE "public"."apartments_apartmentstatus_enum"`);
        await queryRunner.query(`DROP TABLE "poll_boards"`);
        await queryRunner.query(`DROP TABLE "notice_boards"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_joinstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
        await queryRunner.query(`DROP TABLE "complaints"`);
        await queryRunner.query(`DROP TYPE "public"."complaints_status_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_c50ffb94014d69490fef128b5e"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8b3189e4e295616057179dcacf"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0031643723c2c51db64d8ef655"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_3783ac9e14171d77147ea24c84"`);
        await queryRunner.query(`DROP TABLE "Resident"`);
        await queryRunner.query(`DROP TYPE "public"."Resident_residentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."Resident_ishouseholder_enum"`);
    }

}
