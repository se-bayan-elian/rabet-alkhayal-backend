import { MigrationInterface, QueryRunner, TableColumn } from 'typeorm';

export class AddBannerImageToSubcategories1735655000000 implements MigrationInterface {
  name = 'AddBannerImageToSubcategories1735655000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumns('subcategories', [
      new TableColumn({
        name: 'bannerImageUrl',
        type: 'varchar',
        isNullable: true,
      }),
      new TableColumn({
        name: 'bannerImagePublicId',
        type: 'varchar',
        isNullable: true,
      }),
    ]);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropColumns('subcategories', [
      'bannerImageUrl',
      'bannerImagePublicId',
    ]);
  }
}
