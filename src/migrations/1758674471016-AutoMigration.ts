import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1758674471016 implements MigrationInterface {
    name = 'AutoMigration1758674471016'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartments" ADD "adminId" character varying NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "apartments" DROP COLUMN "adminId"`);
    }

}
