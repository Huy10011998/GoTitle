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

@Entity("mortgage")
export class Mortgage extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true, default: null})
    grantor: string;

    @Column("varchar", {nullable: true, default: null})
    grantee: string;

    @Column("float", {nullable: true, default: null})
    amountBorrowed: number;

    @Column("varchar", {nullable: true, default: null})
    deedBook: string;

    @Column("varchar", {nullable: true, default: null})
    deedPage: string;

    @Column("varchar", {nullable: true, default: null})
    pudCondo: string;

    @Column("datetime", {nullable: true, default: null})
    deedDate: string;

    @Column("datetime", {name: "deedRecorded", nullable: true, default: null})
    recDate: string;

    @Column("varchar", {nullable: true, default: null})
    assignedTransfer: string;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => Mortgage, {name: "masterDocumentId", nullable: true, default: null})
    masterDocument: Mortgage;

    @ManyToOne(type => DeedType)
    @JoinColumn({name: "deedTypeId"})
    deedType: DeedType;

    @ManyToOne(type => Title)
    @JoinColumn({name: "titleId"})
    title: Title;

    @ManyToMany(type => DbImage)
    @JoinTable({
        name: "mortgage_db_images",
        joinColumn: {
            name: "mortgageId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
