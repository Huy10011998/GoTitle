import {
    Column,
    JoinColumn,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
    ManyToMany,
    JoinTable
} from "typeorm";

import {Title} from "./Title";
import {DbImage} from "./DbImage";
import {DeedType} from "./DeedType";
import {ApiEntity} from "./ApiEntity";

@Entity("covenant")
export class Covenant extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true, default: null})
    type: string;

    @Column("datetime", {nullable: true, default: null})
    instrumentDate: string;

    @Column("datetime", {nullable: true, default: null})
    dateRecorded: string;

    @Column("varchar", {nullable: true, default: null})
    deedBook: string;

    @Column("varchar", {nullable: true, default: null})
    deedPage: string;

    @Column("simple-json", {nullable: true, default: null})
    reRecordedList: [];

    @Column("simple-json", {nullable: true, default: null})
    supplementedList: [];

    @Column("simple-json", {nullable: true, default: null})
    amendedList: [];

    @Column("boolean", {default: false})
    hasConditions: boolean;

    @Column("boolean", {default: false})
    isMandatoryAssociation: boolean;

    @Column("simple-json", {nullable: true, default: null})
    revisedList: [];

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => Covenant, {name: "masterDocumentId", nullable: true, default: null})
    masterDocument: Covenant;

    @ManyToOne(type => DeedType)
    @JoinColumn({name: "deedTypeId"})
    deedType: DeedType;

    @ManyToOne(type => Title)
    @JoinColumn({name: "titleId"})
    title: Title;

    @ManyToMany(type => DbImage)
    @JoinTable({
        name: "covenant_db_images",
        joinColumn: {
            name: "covenantId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
