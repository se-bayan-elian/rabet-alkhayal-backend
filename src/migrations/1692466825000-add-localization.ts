import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLocalization1692466825000 implements MigrationInterface {
  name = 'AddLocalization1692466825000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Projects table
    await queryRunner.query(`
      ALTER TABLE "projects" 
      ADD COLUMN "name_en" varchar(200) NOT NULL,
      ADD COLUMN "name_ar" varchar(200) NOT NULL,
      ADD COLUMN "description_en" text,
      ADD COLUMN "description_ar" text;
    `);

    // Copy existing data
    await queryRunner.query(`
      UPDATE "projects"
      SET "name_en" = "name",
          "name_ar" = "name",
          "description_en" = "description",
          "description_ar" = "description";
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE "projects"
      DROP COLUMN "name",
      DROP COLUMN "description";
    `);

    // Pricing Plans table
    await queryRunner.query(`
      ALTER TABLE "pricing_plans"
      ADD COLUMN "name_en" varchar(100) NOT NULL,
      ADD COLUMN "name_ar" varchar(100) NOT NULL,
      ADD COLUMN "description_en" text,
      ADD COLUMN "description_ar" text;
    `);

    // Copy existing data
    await queryRunner.query(`
      UPDATE "pricing_plans"
      SET "name_en" = "name",
          "name_ar" = "name",
          "description_en" = "description",
          "description_ar" = "description";
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE "pricing_plans"
      DROP COLUMN "name",
      DROP COLUMN "description";
    `);

    // Features table
    await queryRunner.query(`
      ALTER TABLE "features"
      ADD COLUMN "name_en" varchar(200) NOT NULL,
      ADD COLUMN "name_ar" varchar(200) NOT NULL,
      ADD COLUMN "description_en" text,
      ADD COLUMN "description_ar" text;
    `);

    // Copy existing data
    await queryRunner.query(`
      UPDATE "features"
      SET "name_en" = "name",
          "name_ar" = "name",
          "description_en" = "description",
          "description_ar" = "description";
    `);

    // Drop old columns
    await queryRunner.query(`
      ALTER TABLE "features"
      DROP COLUMN "name",
      DROP COLUMN "description";
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Projects table - revert
    await queryRunner.query(`
      ALTER TABLE "projects"
      ADD COLUMN "name" varchar(200),
      ADD COLUMN "description" text;
    `);

    await queryRunner.query(`
      UPDATE "projects"
      SET "name" = "name_en",
          "description" = "description_en";
    `);

    await queryRunner.query(`
      ALTER TABLE "projects"
      DROP COLUMN "name_en",
      DROP COLUMN "name_ar",
      DROP COLUMN "description_en",
      DROP COLUMN "description_ar";
    `);

    // Pricing Plans table - revert
    await queryRunner.query(`
      ALTER TABLE "pricing_plans"
      ADD COLUMN "name" varchar(100),
      ADD COLUMN "description" text;
    `);

    await queryRunner.query(`
      UPDATE "pricing_plans"
      SET "name" = "name_en",
          "description" = "description_en";
    `);

    await queryRunner.query(`
      ALTER TABLE "pricing_plans"
      DROP COLUMN "name_en",
      DROP COLUMN "name_ar",
      DROP COLUMN "description_en",
      DROP COLUMN "description_ar";
    `);

    // Features table - revert
    await queryRunner.query(`
      ALTER TABLE "features"
      ADD COLUMN "name" varchar(200),
      ADD COLUMN "description" text;
    `);

    await queryRunner.query(`
      UPDATE "features"
      SET "name" = "name_en",
          "description" = "description_en";
    `);

    await queryRunner.query(`
      ALTER TABLE "features"
      DROP COLUMN "name_en",
      DROP COLUMN "name_ar",
      DROP COLUMN "description_en",
      DROP COLUMN "description_ar";
    `);
  }
}
