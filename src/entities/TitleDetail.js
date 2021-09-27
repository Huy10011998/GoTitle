import {
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
    JoinColumn
} from "typeorm";

import {Title} from "./Title";
import {ApiEntity} from "./ApiEntity";

@Entity("title_detail")
export class TitleDetail extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("float", {default: 0})
    clientPrice: number;

    @Column("varchar", {nullable: true})
    companyName: string;

    @Column("varchar", {nullable: true})
    companyFileNumber: string;

    @Column("varchar", {nullable: true})
    companyClientName: string;

    @Column("varchar", {nullable: true})
    companyClientFileNumber: string;

    @Column("boolean", {default: true})
    searchTypeTaxInformationRequest: boolean;

    @Column("varchar", {nullable: true})
    searchTypeCopiesRequested: string;

    @Column("text", {nullable: true})
    specialInstructions: string;

    @Column("varchar", {nullable: true})
    interestResidential: string;

    @Column("varchar", {nullable: true})
    tract: string;

    @Column("varchar", {nullable: true})
    building: string;

    @Column("varchar", {nullable: true})
    acres: string;

    @Column("varchar", {nullable: true})
    metesBound: string;

    @Column("boolean",{default:false})
    hasRealState: boolean;

    @Column("boolean",{default:false})
    hasCivil: boolean;

    @Column("boolean",{default:false})
    hasProbateEstate: boolean;

    @Column("boolean",{default:false})
    hasLiens: boolean;

    @Column("boolean",{default:false})
    hasTaxes: boolean;

    @Column("boolean",{default:false})
    isOpenSection: boolean;

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @OneToOne(type => Title, title => title.titleDetail)
    @JoinColumn({name: "titleId"})
    title: Title;

    constructor() {
        super();
    }
}
