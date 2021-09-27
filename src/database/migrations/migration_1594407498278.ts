import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1594407498278 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` INSERT INTO deed_type ("id", "name", "code", "scope", "docType", "createdAt", "updatedAt") VALUES
            (NULL, "Covenant", "covenant", "master", "covenant", current_timestamp, current_timestamp),
            (NULL, "Re-Recorded", "re_recorded", "secondary", "covenant", current_timestamp, current_timestamp),
            (NULL, "Supplemented", "supplemented", "secondary", "covenant", current_timestamp, current_timestamp),
            (NULL, "Amended", "amended", "secondary", "covenant", current_timestamp, current_timestamp),
            (NULL, "Revised", "revised", "secondary", "covenant", current_timestamp, current_timestamp)`);
        console.log("Deed Type Seeded");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.log("Deed Type Data Cleaned");
    }
}
