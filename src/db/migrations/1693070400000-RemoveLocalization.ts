import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveLocalization1693070400000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Update pricing_plans table
    await queryRunner.query(
      `ALTER TABLE pricing_plans ADD COLUMN name_temp VARCHAR(255), ADD COLUMN description_temp TEXT;`,
    );
    await queryRunner.query(`
      UPDATE pricing_plans SET
        name_temp = COALESCE(name->>'en', name->>'ar', ''),
        description_temp = COALESCE(description->>'en', description->>'ar')
    `);
    await queryRunner.query(
      `UPDATE pricing_plans SET name_temp = 'Unnamed Plan' WHERE name_temp IS NULL OR name_temp = '';`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans DROP COLUMN name, DROP COLUMN description;`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans ALTER COLUMN name_temp SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans RENAME COLUMN name_temp TO name;`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans RENAME COLUMN description_temp TO description;`,
    );

    // Update projects table
    await queryRunner.query(
      `ALTER TABLE projects ADD COLUMN title_temp VARCHAR(255), ADD COLUMN description_temp TEXT;`,
    );
    await queryRunner.query(`
      UPDATE projects SET
        title_temp = COALESCE(title->>'en', title->>'ar', ''),
        description_temp = COALESCE(description->>'en', description->>'ar')
    `);
    await queryRunner.query(`
      UPDATE projects SET 
        title_temp = CASE 
          WHEN title_temp IS NULL OR title_temp = '' THEN 'Untitled Project'
          ELSE title_temp 
        END
    `);
    await queryRunner.query(
      `UPDATE projects SET title_temp = 'Untitled Project' WHERE title_temp IS NULL OR title_temp = '';`,
    );
    await queryRunner.query(
      `ALTER TABLE projects ALTER COLUMN title_temp SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE projects DROP COLUMN title, DROP COLUMN description;`,
    );
    await queryRunner.query(
      `ALTER TABLE projects RENAME COLUMN title_temp TO title;`,
    );
    await queryRunner.query(
      `ALTER TABLE projects RENAME COLUMN description_temp TO description;`,
    );

    // Update features table
    await queryRunner.query(
      `ALTER TABLE features ADD COLUMN name_temp VARCHAR(255), ADD COLUMN description_temp TEXT;`,
    );
    await queryRunner.query(`
      UPDATE features SET
        name_temp = COALESCE(name->>'en', name->>'ar', ''),
        description_temp = COALESCE(description->>'en', description->>'ar')
    `);
    await queryRunner.query(
      `UPDATE features SET name_temp = 'Unnamed Feature' WHERE name_temp IS NULL OR name_temp = '';`,
    );
    await queryRunner.query(
      `ALTER TABLE features DROP COLUMN name, DROP COLUMN description;`,
    );
    await queryRunner.query(
      `ALTER TABLE features ALTER COLUMN name_temp SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE features RENAME COLUMN name_temp TO name;`,
    );
    await queryRunner.query(
      `ALTER TABLE features RENAME COLUMN description_temp TO description;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert pricing_plans table
    await queryRunner.query(
      `ALTER TABLE pricing_plans ADD COLUMN name_temp JSONB, ADD COLUMN description_temp JSONB;`,
    );
    await queryRunner.query(`
      UPDATE pricing_plans SET
        name_temp = jsonb_build_object('en', name, 'ar', name),
        description_temp = CASE 
          WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'ar', description)
          ELSE NULL
        END;
    `);
    await queryRunner.query(
      `ALTER TABLE pricing_plans DROP COLUMN name, DROP COLUMN description;`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans ALTER COLUMN name_temp SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans RENAME COLUMN name_temp TO name;`,
    );
    await queryRunner.query(
      `ALTER TABLE pricing_plans RENAME COLUMN description_temp TO description;`,
    );

    // Revert projects table
    await queryRunner.query(
      `ALTER TABLE projects ADD COLUMN title_temp JSONB, ADD COLUMN description_temp JSONB;`,
    );
    await queryRunner.query(`
      UPDATE projects SET
        title_temp = jsonb_build_object('en', title, 'ar', title),
        description_temp = CASE 
          WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'ar', description)
          ELSE NULL
        END;
    `);
    await queryRunner.query(
      `ALTER TABLE projects DROP COLUMN title, DROP COLUMN description;`,
    );
    await queryRunner.query(
      `ALTER TABLE projects ALTER COLUMN title_temp SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE projects RENAME COLUMN title_temp TO title;`,
    );
    await queryRunner.query(
      `ALTER TABLE projects RENAME COLUMN description_temp TO description;`,
    );

    // Revert features table
    await queryRunner.query(
      `ALTER TABLE features ADD COLUMN name_temp JSONB, ADD COLUMN description_temp JSONB;`,
    );
    await queryRunner.query(`
      UPDATE features SET
        name_temp = jsonb_build_object('en', name, 'ar', name),
        description_temp = CASE 
          WHEN description IS NOT NULL THEN jsonb_build_object('en', description, 'ar', description)
          ELSE NULL
        END;
    `);
    await queryRunner.query(
      `ALTER TABLE features DROP COLUMN name, DROP COLUMN description;`,
    );
    await queryRunner.query(
      `ALTER TABLE features ALTER COLUMN name_temp SET NOT NULL;`,
    );
    await queryRunner.query(
      `ALTER TABLE features RENAME COLUMN name_temp TO name;`,
    );
    await queryRunner.query(
      `ALTER TABLE features RENAME COLUMN description_temp TO description;`,
    );
  }
}
