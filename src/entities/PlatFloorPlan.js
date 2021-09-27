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

@Entity("plat_floor_plan")
export class PlatFloorPlan extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true})
    platBook: string;

    @Column("varchar", {nullable: true})
    platPage: string;

    @Column("varchar", {nullable: true})
    nullaBona: string;

    @Column("varchar", {nullable: true})
    withoutBookPageInfo: string;

    @Column("text", {nullable: true})
    note: string;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => PlatFloorPlan, {name: "masterDocumentId", nullable: true})
    masterDocument: PlatFloorPlan;

    @ManyToOne(type => DeedType)
    @JoinColumn({name: "deedTypeId"})
    deedType: DeedType;

    @ManyToOne(type => Title)
    @JoinColumn({name: "titleId"})
    title: Title;

    @ManyToMany(type => DbImage)
    @JoinTable({
        name: "plat_floor_plans_db_images",
        joinColumn: {
            name: "platFloorPlanId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
