import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1594398391521 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS sync_queue; `);
        queryRunner.query(` CREATE TABLE IF NOT EXISTS sync_queue (
          id        INTEGER PRIMARY KEY NOT NULL,
          objId     INTEGER,
          uri       VARCHAR,
          type      VARCHAR,
          entity    VARCHAR
        ); `);
        console.warn("Create table SyncQueue");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS sync_queue; `);
        console.warn("Table SyncQueue Deleted");
    }

}
