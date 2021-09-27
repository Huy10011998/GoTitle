import {MigrationInterface, QueryRunner} from "typeorm";
import baseUpQueries from "./baseUpQueries";
import baseDownQueries from "./baseDownQueries";

export class migration_1568284316284 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        baseUpQueries.map(async (query) => {
            await queryRunner.query(query);
        });
        console.log("Tables Created");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        baseDownQueries.map(async (query) => {
            await queryRunner.query(query);
        });
        console.log("Tables Deleted");
    }

}
