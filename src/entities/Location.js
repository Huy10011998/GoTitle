import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn
} from "typeorm";

import {Title} from "./Title";
import {ApiEntity} from "./ApiEntity";

@Entity("locations")
export class Location extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true, default: null})
    name: string;

    @Column("varchar", {nullable: true, default: null})
    placeId: string;

    @Column("varchar", {nullable: true, default: null})
    streetNumber: string;

    @Column("varchar", {nullable: true, default: null})
    city: string;

    @Column("varchar", {nullable: true, default: null})
    state: string;

    @Column("varchar", {nullable: true, default: null})
    countryCode: string;

    @Column("varchar", {nullable: true, default: null})
    country: string;

    @Column("varchar", {nullable: true, default: null})
    postCode: string;

    @Column("varchar", {nullable: true, default: null})
    district: string;

    @Column({type: "decimal", precision: 12, scale: 8, nullable: true, default: null})
    latitude: number;

    @Column({type: "decimal", precision: 12, scale: 8, nullable: true, default: null})
    longitude: number;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToOne(type => Title, title => title.location)
    title: Title;
}
