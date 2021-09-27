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

@Entity("lien")
export class Lien extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {name: "lienorPlaintiff", nullable: true, default: null})
    lienor: string;

    @Column("varchar", {name: "debtorDefendant", nullable: true, default: null})
    debtor: string;

    @Column("varchar", {name: "deedBook", nullable: true, default: null})
    book: string;

    @Column("varchar", {name: "deedPage", nullable: true, default: null})
    page: string;

    @Column("float", {name: "lienAmount", nullable: true, default: null})
    amount: number;

    @Column("varchar", {nullable: true, default: null})
    assignedTransferred: string;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => Lien, {name: "masterDocumentId", nullable: true, default: null})
    masterDocument: Lien;

    @ManyToOne(type => DeedType)
    @JoinColumn({name: "deedTypeId"})
    deedType: DeedType;

    @ManyToOne(type => Title)
    @JoinColumn({name: "titleId"})
    title: Title;

    @ManyToMany(type => DbImage)
    @JoinTable({
        name: "lien_db_images",
        joinColumn: {
            name: "lienId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
