import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateReviewsTable1725110400000 implements MigrationInterface {
  name = 'CreateReviewsTable1725110400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "reviews" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "rating" integer NOT NULL,
        "title" character varying NOT NULL,
        "content" text NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "is_featured" boolean NOT NULL DEFAULT false,
        "product_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_4c88e956195bba85977da21b8f4" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_product_id" ON "reviews" ("product_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_user_id" ON "reviews" ("user_id")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_status" ON "reviews" ("status")
    `);

    await queryRunner.query(`
      CREATE INDEX "IDX_reviews_is_featured" ON "reviews" ("is_featured")
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_product_id"
      FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "reviews"
      ADD CONSTRAINT "FK_reviews_user_id"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "reviews"`);
  }
}
