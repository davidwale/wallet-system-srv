import { MigrationInterface, QueryRunner } from "typeorm";

export class Migration1744296025703 implements MigrationInterface {
    name = 'Migration1744296025703'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'successful'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" DROP NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "password" SET NOT NULL`);
        await queryRunner.query(`ALTER TABLE "transaction" ALTER COLUMN "status" SET DEFAULT 'pending'`);
    }

}
