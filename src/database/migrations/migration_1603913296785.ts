import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1603913296785 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`CREATE TABLE IF NOT EXISTS tmp_misc_civil_probate (
                            id             INTEGER PRIMARY KEY NOT NULL,
                            instrumentType VARCHAR,
                            fileNumber     VARCHAR,
                            bookType       VARCHAR,
                            book           VARCHAR,
                            page           VARCHAR,
                            note           TEXT,
                            images         TEXT,
                            createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            syncedAt       DATETIME,
                            apiId          INTEGER,
                            titleId        INTEGER             NOT NULL,
                            deedTypeId     INTEGER             NOT NULL,
                            FOREIGN KEY (titleId) REFERENCES titles (id),
                            FOREIGN KEY (deedTypeId) REFERENCES deed_type (id)
                            );`);
        queryRunner.query(`INSERT INTO tmp_misc_civil_probate SELECT
                            mcp.id,
                            mcp.instrumentType,
                            CAST(mcp.fileNumber AS TEXT),
                            mcp.bookType,
                            mcp.book,
                            mcp.page,
                            mcp.note,
                            mcp.images,
                            mcp.createdAt,
                            mcp.updatedAt,
                            mcp.syncedAt,
                            mcp.apiId,
                            mcp.titleId,
                            mcp.deedTypeId
                            FROM misc_civil_probate AS mcp;`);
        queryRunner.query('DROP TABLE IF EXISTS misc_civil_probate');
        queryRunner.query(`CREATE TABLE IF NOT EXISTS misc_civil_probate (
                            id             INTEGER PRIMARY KEY NOT NULL,
                            instrumentType VARCHAR,
                            fileNumber     VARCHAR,
                            bookType       VARCHAR,
                            book           VARCHAR,
                            page           VARCHAR,
                            note           TEXT,
                            images         TEXT,
                            createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            syncedAt       DATETIME,
                            apiId          INTEGER,
                            titleId        INTEGER             NOT NULL,
                            deedTypeId     INTEGER             NOT NULL,
                            FOREIGN KEY (titleId) REFERENCES titles (id),
                            FOREIGN KEY (deedTypeId) REFERENCES deed_type (id)
                            );`);
        queryRunner.query(`INSERT INTO misc_civil_probate SELECT
                            tmcp.id,
                            tmcp.instrumentType,
                            tmcp.fileNumber,
                            tmcp.bookType,
                            tmcp.book,
                            tmcp.page,
                            tmcp.note,
                            tmcp.images,
                            tmcp.createdAt,
                            tmcp.updatedAt,
                            tmcp.syncedAt,
                            tmcp.apiId,
                            tmcp.titleId,
                            tmcp.deedTypeId
                            FROM tmp_misc_civil_probate AS tmcp;`);

        queryRunner.query('DROP TABLE IF EXISTS tmp_misc_civil_probate');
        console.warn("Change fileNumber of INTEGER a VARCHAR in misc_civil_probate");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`CREATE TABLE IF NOT EXISTS tmp_misc_civil_probate (
                            id             INTEGER PRIMARY KEY NOT NULL,
                            instrumentType VARCHAR,
                            fileNumber     INTEGER,
                            bookType       VARCHAR,
                            book           VARCHAR,
                            page           VARCHAR,
                            note           TEXT,
                            images         TEXT,
                            createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            syncedAt       DATETIME,
                            apiId          INTEGER,
                            titleId        INTEGER             NOT NULL,
                            deedTypeId     INTEGER             NOT NULL,
                            FOREIGN KEY (titleId) REFERENCES titles (id),
                            FOREIGN KEY (deedTypeId) REFERENCES deed_type (id)
                            );`);
        queryRunner.query(`INSERT INTO tmp_misc_civil_probate SELECT
                            mcp.id,
                            mcp.instrumentType,
                            CAST(mcp.fileNumber AS INTEGER),
                            mcp.bookType,
                            mcp.book,
                            mcp.page,
                            mcp.note,
                            mcp.images,
                            mcp.createdAt,
                            mcp.updatedAt,
                            mcp.syncedAt,
                            mcp.apiId,
                            mcp.titleId,
                            mcp.deedTypeId
                            FROM misc_civil_probate AS mcp;`);
        queryRunner.query('DROP TABLE IF EXISTS misc_civil_probate');
        queryRunner.query(`CREATE TABLE IF NOT EXISTS misc_civil_probate (
                            id             INTEGER PRIMARY KEY NOT NULL,
                            instrumentType VARCHAR,
                            fileNumber     INTEGER,
                            bookType       VARCHAR,
                            book           VARCHAR,
                            page           VARCHAR,
                            note           TEXT,
                            images         TEXT,
                            createdAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updatedAt      DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            syncedAt       DATETIME,
                            apiId          INTEGER,
                            titleId        INTEGER             NOT NULL,
                            deedTypeId     INTEGER             NOT NULL,
                            FOREIGN KEY (titleId) REFERENCES titles (id),
                            FOREIGN KEY (deedTypeId) REFERENCES deed_type (id)
                            );`);
        queryRunner.query(`INSERT INTO misc_civil_probate SELECT
                            tmcp.id,
                            tmcp.instrumentType,
                            tmcp.fileNumber,
                            tmcp.bookType,
                            tmcp.book,
                            tmcp.page,
                            tmcp.note,
                            tmcp.images,
                            tmcp.createdAt,
                            tmcp.updatedAt,
                            tmcp.syncedAt,
                            tmcp.apiId,
                            tmcp.titleId,
                            tmcp.deedTypeId
                            FROM tmp_misc_civil_probate AS tmcp;`);
        queryRunner.query('DROP TABLE IF EXISTS tmp_misc_civil_probate');
        console.warn("Change fileNumber of VARCHAR a INTEGER in misc_civil_probate");
    }

}

