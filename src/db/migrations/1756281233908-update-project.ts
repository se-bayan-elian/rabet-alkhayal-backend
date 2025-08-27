import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProject1756281233908 implements MigrationInterface {
    name = 'UpdateProject1756281233908'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "projects" DROP COLUMN "image_public_id"`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '"2025-08-27T07:54:10.090Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-08-27T07:54:10.090Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '2025-08-27 07:10:12.365'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '2025-08-27 07:10:12.365'`);
        await queryRunner.query(`ALTER TABLE "projects" ADD "image_public_id" character varying(500)`);
    }

}
