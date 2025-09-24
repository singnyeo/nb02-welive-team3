import { MigrationInterface, QueryRunner } from "typeorm";

export class AutoMigration1758675387461 implements MigrationInterface {
    name = 'AutoMigration1758675387461'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_108456969a2cb5d24d7f2541049"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "apartmentId" DROP NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_108456969a2cb5d24d7f2541049" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "FK_108456969a2cb5d24d7f2541049"`);
        await queryRunner.query(`ALTER TABLE "users" ALTER COLUMN "apartmentId" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "FK_108456969a2cb5d24d7f2541049" FOREIGN KEY ("apartmentId") REFERENCES "apartments"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
