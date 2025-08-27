import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdatePricingPlanPriceFields1708857600000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, add new columns if they don't exist
    await queryRunner.query(`
            DO $$ 
            BEGIN
                BEGIN
                    ALTER TABLE pricing_plans 
                    ADD COLUMN original_price DECIMAL(10,2);
                EXCEPTION
                    WHEN duplicate_column THEN 
                    NULL;
                END;
                
                BEGIN
                    ALTER TABLE pricing_plans 
                    ADD COLUMN final_price DECIMAL(10,2);
                EXCEPTION
                    WHEN duplicate_column THEN 
                    NULL;
                END;
            END $$;
        `);

    // Set default values for the new columns
    await queryRunner.query(`
            UPDATE pricing_plans 
            SET original_price = 0,
                final_price = 0
            WHERE original_price IS NULL OR final_price IS NULL
        `);

    // Make the new columns not null
    await queryRunner.query(`
            ALTER TABLE pricing_plans 
            ALTER COLUMN original_price SET NOT NULL,
            ALTER COLUMN final_price SET NOT NULL
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Add back the price column if it doesn't exist
    await queryRunner.query(`
            DO $$ 
            BEGIN
                BEGIN
                    ALTER TABLE pricing_plans 
                    ADD COLUMN price DECIMAL(10,2);
                EXCEPTION
                    WHEN duplicate_column THEN 
                    NULL;
                END;
            END $$;
        `);

    // Copy final_price to price column
    await queryRunner.query(`
            UPDATE pricing_plans 
            SET price = final_price
            WHERE final_price IS NOT NULL
        `);

    // Drop new columns if they exist
    await queryRunner.query(`
            ALTER TABLE pricing_plans 
            DROP COLUMN IF EXISTS original_price,
            DROP COLUMN IF EXISTS final_price
        `);

    // Make price column not null
    await queryRunner.query(`
            ALTER TABLE pricing_plans 
            ALTER COLUMN price SET NOT NULL
        `);
  }
}
