import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class migration_1600091088078 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE titles ADD COLUMN mainInvoice INTEGER;`);
        queryRunner.query(`ALTER TABLE titles ADD COLUMN initialCustomer INTEGER REFERENCES customer (id);`);

        console.log("Add mainInvoice, initialCustomer in titles");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute mainInvoice, initialCustomer cannot be removed");
    }

}

