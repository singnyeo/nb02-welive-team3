import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1761896339202 implements MigrationInterface {
    name = 'AutoMigration1761896339202'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_8205c52b0510064812e1359f0ec"`);
        await queryRunner.query(`ALTER TABLE "comments" DROP COLUMN "complaint_id"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_ffa7953c331a2fe7362daece2cc" FOREIGN KEY ("complaintId") REFERENCES "complaints"("complaintId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "comments" DROP CONSTRAINT "FK_ffa7953c331a2fe7362daece2cc"`);
        await queryRunner.query(`ALTER TABLE "comments" ADD "complaint_id" uuid`);
        await queryRunner.query(`ALTER TABLE "comments" ADD CONSTRAINT "FK_8205c52b0510064812e1359f0ec" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("complaintId") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
