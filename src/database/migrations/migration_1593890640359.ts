import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1593890640359 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` CREATE TABLE IF NOT EXISTS db_image (
        id          INTEGER PRIMARY KEY NOT NULL,
        apiId       INTEGER,
        name        VARCHAR,
        imageData   TEXT,
        createdAt   DATETIME DEFAULT current_timestamp NOT NULL,
        updatedAt   DATETIME DEFAULT current_timestamp NOT NULL,
        syncedAt    DATETIME
 ); `);
        console.warn("Create Table DbImage");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS "db_image"; `);
        console.warn("Drop Table DbImage");
    }

}