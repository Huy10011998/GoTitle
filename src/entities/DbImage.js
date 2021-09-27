import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {ApiEntity} from "./ApiEntity";


@Entity("db_image")
export class DbImage extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar")
    name: string;

    @Column("int", {nullable: true, default: null})
    position: number;

    @Column("simple-json", {nullable: true, default: null})
    imageData: {};

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    constructor() {
        super();
    }
}
