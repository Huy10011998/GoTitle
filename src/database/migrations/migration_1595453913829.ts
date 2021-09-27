import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1595453913829 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {

        queryRunner.query(`ALTER TABLE titles ADD legalAddress VARCHAR; `);

        console.log("LegalAddress in titles");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute LegalAddress cannot be removed");
    }

}
