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

@Entity("tax")
export class Tax extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar", {nullable: true, default: null})
    county: string;

    @Column("varchar", {nullable: true, default: null})
    taxYear: string;

    @Column("varchar", {nullable: true, default: null})
    taxpayerName: string;

    @Column("float", {nullable: true, default: null})
    assessedValue: number;

    @Column("varchar", {nullable: true, default: null})
    parcelId: string;

    @Column("float", {nullable: true, default: null})
    amountPaid: number;

    @Column("datetime", {nullable: true, default: null})
    datePaid: string;

    @Column("float", {nullable: true, default: null})
    amountOwned: number;

    @Column("datetime", {nullable: true, default: null})
    dateDue: string;

    @Column("varchar", {nullable: true, default: null})
    municipality: string;

    @Column("varchar", {nullable: true, default: null})
    accountNumber: string;

    @Column("float", {nullable: true, default: null})
    municipalAmountPaid: number;

    @Column("datetime", {nullable: true, default: null})
    municipalDatePaid: string;

    @Column("float", {nullable: true, default: null})
    municipalAmountOwned: number;

    @Column("datetime", {nullable: true, default: null})
    municipalDateDue: string;

    @Column("varchar", {nullable: true, default: null})
    water: string;

    @Column("varchar", {nullable: true, default: null})
    sewer: string;

    @Column("varchar", {nullable: true, default: null})
    sanitation: string;

    @Column("varchar", {nullable: true, default: null})
    documentDescription: string;

    @Column("varchar",{nullable: true,default:null})
    municipalTaxYear:string;

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
        name: "tax_db_images",
        joinColumn: {
            name: "taxId",
            referencedColumnName: 'id'
        },
        inverseJoinColumn: {
            name: "dbImageId",
            referencedColumnName: 'id'
        }
    })
    dbImageList: DbImage[];
}
