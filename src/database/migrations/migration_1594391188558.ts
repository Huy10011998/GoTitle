import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1594391188558 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {

        queryRunner.query(`ALTER TABLE covenant ADD masterDocumentId INTEGER; `);
        queryRunner.query(`ALTER TABLE covenant ADD deedTypeId INTEGER;`);

        console.log("Add covenant, masterDocument,deedTypeId in tables ");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute masterDocument, deedTypeId");
    }

}

