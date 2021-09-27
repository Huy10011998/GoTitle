import {
    Column,
    JoinColumn,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";

import {Title, ApiEntity} from "./index"

@Entity("title_buyer")
export class TitleBuyer extends ApiEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar")
    name: string;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => Title)
    @JoinColumn({name: "titleId"})
    title: Title;
}
