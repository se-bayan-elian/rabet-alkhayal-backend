import { MigrationInterface, QueryRunner } from 'typeorm';

export class RemoveCurrencyFromPricingPlans1708858100000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pricing_plans
            DROP COLUMN IF EXISTS currency;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE pricing_plans
            ADD COLUMN currency varchar(3) DEFAULT 'USD';
        `);
  }
}
