import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1602532790729 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE titles ADD COLUMN tokenReportPdf VARCHAR;`);

        console.log("Add tokenReportPdf in title");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute tokenReportPdf cannot be removed");
    }

}

