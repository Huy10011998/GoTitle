
import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1598903068771 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS users; `);

        queryRunner.query(`    CREATE TABLE IF NOT EXISTS users(
            id                       INTEGER PRIMARY KEY NOT NULL,
            name                     VARCHAR             NOT NULL,
            lastName                 VARCHAR,             
            email                    VARCHAR,
            lastLogin                DATETIME,
            lastActive               DATETIME,
            profileImage             TEXT,
            emailNotificationsActive INTEGER  DEFAULT 1,
            password                 VARCHAR,
            rememberToken            VARCHAR,
            createdAt                DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            updatedAt                DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
            stripeId                 VARCHAR,
            cardBrand                VARCHAR,
            cardLastFour             VARCHAR,
            trialEndsAt              DATE,
            profileId                INTEGER,
            userSettingId            INTEGER,
            apiId                    INTEGER
    );`);


        console.warn("Create table Users");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` DROP TABLE IF EXISTS users; `);
        console.warn("Table Users Deleted");
    }

}
