import { MigrationInterface, QueryRunner } from "typeorm";

export class UpdateProjectsStructure1756286383163 implements MigrationInterface {
    name = 'UpdateProjectsStructure1756286383163'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '"2025-08-27T09:19:48.986Z"'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '"2025-08-27T09:19:48.986Z"'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "updatedAt" SET DEFAULT '2025-08-27 08:31:21.591'`);
        await queryRunner.query(`ALTER TABLE "user" ALTER COLUMN "createdAt" SET DEFAULT '2025-08-27 08:31:21.59'`);
    }

}
