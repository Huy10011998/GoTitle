import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1596207649307 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` UPDATE deed_type SET code ='affidavit_secondary' WHERE code = 'affidavit' and  scope='secondary'; `);
        console.warn("Update DeedType");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`  UPDATE deed_type SET code ='affidavit' WHERE code = 'affidavit_secondary' and scope='secondary'; `);
        console.warn("Update DeedType");
    }

}
