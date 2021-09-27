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

@Entity("easement")
export class Easement extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("datetime", {name: "recordingDate", nullable: true, default: null})
    recDate: string;

    @Column("varchar", {nullable: true, default: null})
    deedBook: string;

    @Column("varchar", {nullable: true, default: null})
    deedPage: string;

    @Column("datetime", {nullable: true, default: null})
    deedDate: string;

    @Column("varchar", {nullable: true, default: null})
    grantor: string;

    @Column("varchar", {nullable: true, default: null})
    grantee: string;

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
        name: "easement_db_images",
        joinColumn: {
            name: "easementId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
