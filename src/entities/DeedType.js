import {
    Column,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn
} from "typeorm";
import {ApiEntity} from "./ApiEntity";

@Entity("deed_type")
export class DeedType extends ApiEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar")
    name: string;

    @Column("varchar")
    code: string;

    @Column("varchar")
    scope: string;

    @Column("varchar")
    docType: string;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    constructor() {
        super();
        this.apiRoute = 'deed-types';
        this.apiReadOnly = true;
    }
}
