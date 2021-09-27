import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1598026194823 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` UPDATE deed_type SET code ='affidavit_secondary' WHERE code = 'affidavit'and docType = 'mortgage'; `);
        console.warn("Update DeedType of Mortgage");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` UPDATE deed_type SET code ='affidavit' WHERE code = 'affidavit'and docType = 'mortgage'; `);
        console.warn("Update DeedType of Mortgage");
    }

}