import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class migration_1603378932302 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE tax ADD COLUMN municipalTaxYear VARCHAR;`);

        console.log("Add municipalTaxYear in tax");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute municipalTaxYear cannot be removed");
    }

}