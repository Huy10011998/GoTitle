import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class migration_1595510348546 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE titles ADD COLUMN currentOwnerDeedId INTEGER REFERENCES deed (id);`);

        console.log("Add CurrentOwnerDeedId in titles");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute CurrentOwnerDeedId cannot be removed");
    }

}
