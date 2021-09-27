import {
    Column,
    JoinColumn,
    CreateDateColumn,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn
} from "typeorm";

import {Title, ApiEntity} from "./index";

@Entity("title_book_page")
export class TitleBookPage extends ApiEntity{

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true})
    book: string;

    @Column("varchar", {nullable: true})
    page: string;

    @Column("varchar", {nullable: true})
    withoutBookPageInfo: string;

    @Column("varchar", {nullable: true})
    type: string;

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
