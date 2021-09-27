import {
    Column,
    JoinColumn,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn, ManyToMany, JoinTable
} from "typeorm";

import {Title} from "./Title";
import {DeedType} from "./DeedType";
import {DbImage} from "./DbImage";
import {ApiEntity} from "./ApiEntity";

@Entity("misc_civil_probate")
export class MiscCivilProbate extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true, default: null})
    instrumentType: string;

    @Column("varchar", {nullable: true, default: null})
    fileNumber: string;

    @Column("varchar", {nullable: true, default: null})
    bookType: string;

    @Column("varchar", {nullable: true, default: null})
    book: string;

    @Column("varchar", {nullable: true, default: null})
    page: string;

    @Column("text", {nullable: true, default: null})
    note: string;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => DeedType)
    @JoinColumn({name: "deedTypeId"})
    deedType: DeedType;

    @ManyToOne(type => Title)
    @JoinColumn({name: "titleId"})
    title: Title;

    @ManyToMany(type => DbImage)
    @JoinTable({
        name: "misc_civil_probates_db_images",
        joinColumn: {
            name: "miscCivilProbateId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
