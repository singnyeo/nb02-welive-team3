import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1758673768779 implements MigrationInterface {
    name = 'AutoMigration1758673768779'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3"`);
        await queryRunner.query(`CREATE TYPE "public"."residents_ishouseholder_enum" AS ENUM('HOUSEHOLDER', 'MEMBER')`);
        await queryRunner.query(`CREATE TYPE "public"."residents_residentstatus_enum" AS ENUM('RESIDENCE', 'NO_RESIDENCE')`);
        await queryRunner.query(`CREATE TABLE "residents" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(50) NOT NULL, "contact" character varying(20) NOT NULL, "building" character varying(10) NOT NULL, "unitNumber" character varying(10) NOT NULL, "isHouseholder" "public"."residents_ishouseholder_enum" NOT NULL DEFAULT 'MEMBER', "residentStatus" "public"."residents_residentstatus_enum" NOT NULL DEFAULT 'RESIDENCE', "isRegistered" boolean NOT NULL DEFAULT false, "apartmentId" uuid NOT NULL, "deletedAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" uuid, CONSTRAINT "REL_3b7ff30eaf080e784c2a3492f3" UNIQUE ("userId"), CONSTRAINT "PK_4c8d0413ee0e9a4ebbf500f7365" PRIMARY KEY ("id")); COMMENT ON COLUMN "residents"."name" IS '입주민 이름'; COMMENT ON COLUMN "residents"."contact" IS '연락처'; COMMENT ON COLUMN "residents"."building" IS '동'; COMMENT ON COLUMN "residents"."unitNumber" IS '호수'; COMMENT ON COLUMN "residents"."isHouseholder" IS '세대 여부'; COMMENT ON COLUMN "residents"."residentStatus" IS '거주 여부'; COMMENT ON COLUMN "residents"."isRegistered" IS '위리브 가입 여부'`);
        await queryRunner.query(`CREATE INDEX "IDX_8fdb25e18fd6f60567a190ae31" ON "residents" ("name") `);
        await queryRunner.query(`CREATE INDEX "IDX_76663b0dfb9bc282d88f8b6e63" ON "residents" ("contact") `);
        await queryRunner.query(`CREATE INDEX "IDX_8beb11a2fc9db8b5c6b9755f6f" ON "residents" ("building") `);
        await queryRunner.query(`CREATE INDEX "IDX_203994944fd0974433d2354697" ON "residents" ("unitNumber") `);
        await queryRunner.query(`ALTER TABLE "residents" ADD CONSTRAINT "FK_3b7ff30eaf080e784c2a3492f32" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "residents" ADD CONSTRAINT "FK_c27986c3d64e11354652e942846" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3" FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3"`);
        await queryRunner.query(`ALTER TABLE "residents" DROP CONSTRAINT "FK_c27986c3d64e11354652e942846"`);
        await queryRunner.query(`ALTER TABLE "residents" DROP CONSTRAINT "FK_3b7ff30eaf080e784c2a3492f32"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_203994944fd0974433d2354697"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8beb11a2fc9db8b5c6b9755f6f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_76663b0dfb9bc282d88f8b6e63"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_8fdb25e18fd6f60567a190ae31"`);
        await queryRunner.query(`DROP TABLE "residents"`);
        await queryRunner.query(`DROP TYPE "public"."residents_residentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."residents_ishouseholder_enum"`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_a0e2e451cd46b8db454758a81e3" FOREIGN KEY ("residentId") REFERENCES "Resident"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
