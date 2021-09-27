import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1595608405280 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` CREATE TABLE IF NOT EXISTS covenant_db_images (
          covenantId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS deed_db_images (
          deedId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS easement_db_images (
          easementId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS lien_db_images (
          lienId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS misc_civil_probates_db_images (
          miscCivilProbateId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS mortgage_db_images (
          mortgageId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS plat_floor_plans_db_images (
          platFloorPlanId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS tax_db_images (
          taxId        INTEGER NOT NULL,
          dbImageId     INTEGER NOT NULL
        ); `);


        console.warn("Create many to many relations DbImage");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS covenant_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS deed_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS easement_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS lien_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS misc_civil_probates_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS mortgage_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS plat_floor_plans_db_images; `);
        queryRunner.query(` DROP TABLE IF EXISTS tax_db_images; `);
        console.warn("Tables DbImage relationship Deleted");
    }

}
