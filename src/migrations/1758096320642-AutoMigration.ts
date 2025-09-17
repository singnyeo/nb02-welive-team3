import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1758096320642 implements MigrationInterface {
    name = 'AutoMigration1758096320642'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."users_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN')`);
        await queryRunner.query(`CREATE TYPE "public"."users_joinstatus_enum" AS ENUM('PENDING', 'APPROVED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "username" character varying NOT NULL, "password" character varying NOT NULL, "contact" character varying NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "role" "public"."users_role_enum" NOT NULL DEFAULT 'USER', "joinStatus" "public"."users_joinstatus_enum" NOT NULL DEFAULT 'PENDING', "isActive" boolean NOT NULL DEFAULT true, "apartmentDong" character varying, "apartmentHo" character varying, "avatarUrl" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "apartmentId" uuid, CONSTRAINT "UQ_fe0bb3f6520ee0469504521e710" UNIQUE ("username"), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "apartments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "apartmentName" character varying NOT NULL, "apartmentAddress" character varying NOT NULL, "apartmentManagementNumber" character varying NOT NULL, "description" character varying, "startComplexNumber" character varying, "endComplexNumber" character varying, "startDongNumber" character varying, "endDongNumber" character varying, "startFloorNumber" character varying, "endFloorNumber" character varying, "startHoNumber" character varying, "endHoNumber" character varying, "imageUrl" character varying(255), "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_fefde8b9a2f8b57f3762e449638" UNIQUE ("apartmentManagementNumber"), CONSTRAINT "PK_f6058e85d6d715dbe22b72fe722" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_108456969a2cb5d24d7f2541049" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_108456969a2cb5d24d7f2541049"`);
        await queryRunner.query(`DROP TABLE "apartments"`);
        await queryRunner.query(`DROP TABLE "users"`);
        await queryRunner.query(`DROP TYPE "public"."users_joinstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."users_role_enum"`);
    }

}
