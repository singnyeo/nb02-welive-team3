import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1761910278587 implements MigrationInterface {
    name = 'AutoMigration1761910278587'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "commentId" TO "id"`);
        await queryRunner.query(`ALTER TABLE "comments" RENAME CONSTRAINT "PK_b302f2e474ce2a6cbacd7981aa5" TO "PK_8bf68bc960f2b69e818bdb90dcb"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" RENAME CONSTRAINT "PK_8bf68bc960f2b69e818bdb90dcb" TO "PK_b302f2e474ce2a6cbacd7981aa5"`);
        await queryRunner.query(`ALTER TABLE "comments" RENAME COLUMN "id" TO "commentId"`);
    }

}
