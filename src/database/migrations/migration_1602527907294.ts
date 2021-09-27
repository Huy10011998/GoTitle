import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class migration_1602527907294 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE deed ADD COLUMN currentOwner INTEGER  DEFAULT 0 NOT NULL;`);
        queryRunner.query(`ALTER TABLE titles ADD currentOwnerDeedList TEXT; `);

        console.log("Add currentOwner in deed and Add currentOwnerDeedList in titles");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute currentOwner, currentOwnerDeedList cannot be removed");
    }

}