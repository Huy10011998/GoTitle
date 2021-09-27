import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1593790640359 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` UPDATE deed_type SET docType='deed' WHERE docType = 'chain_of_title' ; `);
        console.warn("Update DeedType");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` UPDATE deed_type SET docType='chain_of_title' WHERE docType = 'deed'; `);
        console.warn("Update DeedType");
    }

}