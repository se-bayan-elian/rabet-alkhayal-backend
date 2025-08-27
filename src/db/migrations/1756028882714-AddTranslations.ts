import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTranslations1756028882714 implements MigrationInterface {
    name = 'AddTranslations1756028882714'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '"2025-08-24T09:48:16.403Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-08-24T09:48:16.403Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '2025-08-24 09:47:42.637'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '2025-08-24 09:47:42.637'`);
    }

}
