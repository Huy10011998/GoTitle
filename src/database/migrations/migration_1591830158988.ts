import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1591830158988 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` CREATE TABLE IF NOT EXISTS oauth_tokens(
          access_token  VARCHAR(100) PRIMARY KEY,
          expires_in    VARCHAR(100),
          refresh_token VARCHAR(100),
          token_type    VARCHAR(100),
          username      VARCHAR(100),
          created_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
          updated_at    DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
          expired_at    DATETIME
        );`);
        console.log("Oauth Tokens Created");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`DROP TABLE IF EXISTS oauth_tokens;`);
        console.log("Table Oauth Tokens Deleted");
    }

}
