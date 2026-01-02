import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1761897327935 implements MigrationInterface {
    name = 'AutoMigration1761897327935'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_a797d02b585c931c854d88d94f2"`);
        await queryRunner.query(`ALTER TABLE "complaints" ALTER COLUMN "boardId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_a797d02b585c931c854d88d94f2" FOREIGN KEY ("boardId") REFERENCES "complaint_boards"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "complaints" DROP CONSTRAINT "FK_a797d02b585c931c854d88d94f2"`);
        await queryRunner.query(`ALTER TABLE "complaints" ALTER COLUMN "boardId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "complaints" ADD CONSTRAINT "FK_a797d02b585c931c854d88d94f2" FOREIGN KEY ("boardId") REFERENCES "complaint_boards"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

}
