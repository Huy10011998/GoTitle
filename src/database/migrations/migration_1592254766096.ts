import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1592254766096 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE titles ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE titles ADD source VARCHAR(100) DEFAULT 'gotitle'; `);
        queryRunner.query(`ALTER TABLE titles ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE title_book_page ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE title_book_page ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE title_buyer ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE title_buyer ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE title_seller ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE title_seller ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE title_detail ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE title_detail ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE locations ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE locations ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE deed_type ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE deed_type ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE covenant ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE covenant ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE deed ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE deed ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE easement ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE easement ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE lien ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE lien ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE misc_civil_probate ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE misc_civil_probate ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE mortgage ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE mortgage ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE plat_floor_plan ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE plat_floor_plan ADD apiId INTEGER; `);
        queryRunner.query(`ALTER TABLE tax ADD syncedAt DATETIME; `);
        queryRunner.query(`ALTER TABLE tax ADD apiId INTEGER; `);

        console.log("Add SyncedAt, ApiId in tables");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute SyncedAt, ApiId cannot be removed");
    }

}
