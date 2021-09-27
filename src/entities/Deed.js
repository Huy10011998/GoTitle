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

import {ApiEntity, Title, DeedType, DbImage} from "./index";

@Entity("deed")
export class Deed extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true, default: null})
    grantor: string;

    @Column("varchar", {nullable: true, default: null})
    grantee: string;

    @Column("varchar", {nullable: true, default: null})
    deedBook: string;

    @Column("varchar", {nullable: true, default: null})
    deedPage: string;

    @Column("datetime", {nullable: true, default: null})
    deedDate: string;

    @Column("datetime", {name: "recordingDate", nullable: true, default: null})
    recDate: string;

    @Column("boolean",{default:false})
    currentOwner: boolean;

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
        name: "deed_db_images",
        joinColumn: {
            name: "deedId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
