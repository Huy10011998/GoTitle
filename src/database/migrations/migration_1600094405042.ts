import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1600094405042 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS customer; `);

        queryRunner.query(`    CREATE TABLE IF NOT EXISTS customer(
            id                  INTEGER PRIMARY KEY NOT NULL,
            apiId               INTEGER,
            name                VARCHAR,
            fileNumber          VARCHAR,
            email               VARCHAR,
            companyName         VARCHAR,
            companyFileNumber   VARCHAR,
            createdAt   DATETIME DEFAULT current_timestamp NOT NULL,
            updatedAt   DATETIME DEFAULT current_timestamp NOT NULL,
            syncedAt    DATETIME
    );`);


        console.warn("Create table Customer");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS customer; `);
        console.warn("Table customer Deleted");
    }

}