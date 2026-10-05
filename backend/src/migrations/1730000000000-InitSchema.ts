import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1730000000000 implements MigrationInterface {
  name = 'InitSchema1730000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "columns" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "name" text NOT NULL,
        "type" text NOT NULL CHECK ("type" IN ('text', 'number', 'date', 'phone')),
        "position" integer NOT NULL,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" serial PRIMARY KEY,
        "values" jsonb NOT NULL DEFAULT '{}'::jsonb,
        "created_at" timestamptz NOT NULL DEFAULT now()
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "contacts"`);
    await queryRunner.query(`DROP TABLE "columns"`);
  }
}
