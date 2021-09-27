import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1595425298200 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` CREATE TABLE IF NOT EXISTS customer (
        id                  INTEGER PRIMARY KEY NOT NULL,
        apiId               INTEGER,
        name                VARCHAR,
        fileNumber          VARCHAR,
        email               VARCHAR,
        titleId             INTEGER,
        companyName         VARCHAR,
        companyFileNumber   VARCHAR,
        createdAt   DATETIME DEFAULT current_timestamp NOT NULL,
        updatedAt   DATETIME DEFAULT current_timestamp NOT NULL,
        syncedAt    DATETIME,
        FOREIGN KEY (titleId) REFERENCES titles (id)
 ); `);
        console.warn("Create Table Customer");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS "customer"; `);
        console.warn("Drop Table Customer");
    }

}