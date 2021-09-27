import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    OneToOne,
    JoinColumn
} from "typeorm";

import {Title} from "./Title";
import {ApiEntity} from "./ApiEntity";

@Entity("customer")
export class Customer extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar",{nullable: true})
    name: string;

    @Column("varchar",{nullable: true})
    fileNumber: string;

    @Column("varchar",{nullable: true})
    email: string;

    @Column("varchar",{nullable: true})
    companyName: string;

    @Column("varchar",{nullable: true})
    companyFileNumber: string;

    @Column("varchar",{nullable: true})
    clientAddress: string;

    @Column("datetime", {nullable: true})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToOne(type => Title, title => title.customer)
    title: Title;
}
