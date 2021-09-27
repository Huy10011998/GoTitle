import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class migration_1601311285291 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE customer ADD COLUMN clientAddress VARCHAR;`);

        console.log("Add clientAddress in customer");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute clientAddress cannot be removed");
    }

}

