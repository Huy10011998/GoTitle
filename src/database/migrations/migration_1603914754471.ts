import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1603914754471 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`DELETE FROM deed_type;`);
        console.warn("delete all data from deed_type");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        // queryRunner.query(`ALTER TABLE titles ADD currentOwnerDeedId INTEGER;`);

        // console.warn("Add currentOwnerDeed in title");
    }

}
