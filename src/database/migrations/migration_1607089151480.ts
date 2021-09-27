import {MigrationInterface, QueryRunner,TableForeignKey} from "typeorm";

export class migration_1607089151480 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE db_image ADD COLUMN position INTEGER;`);

        console.log("Add Position attribute in DBImage");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        console.warn("The attribute position in DBImage cannot be removed");
    }

}