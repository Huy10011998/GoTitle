import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    OneToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
    ManyToOne,
} from "typeorm";

import {
    Location,
    Mortgage,
    Deed,
    Easement,
    Lien,
    MiscCivilProbate,
    PlatFloorPlan,
    Tax,
    TitleBookPage,
    TitleBuyer,
    TitleSeller,
    Customer,
    User,
    TitleDetail,
    ApiEntity
} from "./index";

@Entity("titles")
export class Title extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: string;

    @Column("varchar", {nullable: true, default: 'gotitle'})
    source: string;

    @Column("float", {nullable: true, default: 0})
    price: number;

    @Column("varchar", {nullable: true, default: null})
    searchType: string;

    @Column("varchar", {nullable: true, default: null})
    searchTypeDetail: string;

    @Column("varchar", {nullable: true, default: null})
    searchTypeDetailValue: string;

    @Column("datetime", {nullable: true, default: null})
    dateSearch: string;

    @Column("datetime", {nullable: true, default: null})
    dateEffective: string;

    @Column("varchar", {nullable: true, default: null})
    condoName: string;

    @Column("varchar", {nullable: true, default: null})
    district: string;

    @Column("varchar", {nullable: true, default: null})
    landLot: string;

    @Column("integer", {nullable: true, default: null})
    section: number;

    @Column("integer", {nullable: true, default: null})
    township: number;

    @Column("integer", {name: 'range', nullable: true, default: null})
    range: number;

    @Column("varchar", {nullable: true, default: null})
    lot: string;

    @Column("varchar", {nullable: true, default: null})
    block: string;

    @Column("varchar", {nullable: true, default: null})
    pod: string;

    @Column("varchar", {nullable: true, default: null})
    subdivisionSection: string;

    @Column("varchar", {nullable: true, default: null})
    parking: string;

    @Column("varchar", {nullable: true, default: null})
    garage: string;

    @Column("varchar", {nullable: true, default: null})
    interestCommon: string;

    @Column("varchar", {nullable: true, default: null})
    phase: string;

    @Column("varchar", {nullable: true, default: null})
    storage: string;

    @Column("varchar", {nullable: true, default: null})
    unit: string;

    @Column("varchar", {nullable: true, default: null})
    wine: string;

    @Column("varchar", {nullable: true, default: null})
    revised: string;

    @Column("text", {nullable: true, default: null})
    longLegal: string;

    @Column("varchar", {nullable: true, default: null})
    type: string;

    @Column("varchar", {nullable: true, default: null})
    gmd: string;

    @Column("simple-json", {nullable: true, default: null})
    zones: {};

    @Column("varchar", {nullable: true, default: null})
    rtv: string;

    @Column("varchar", {nullable: true, default: null})
    dbPg: string;

    @Column("varchar", {nullable: true, default: null})
    jtwros: string;

    @Column("text", {nullable: true, default: null})
    note: string;

    @Column("integer", {nullable: true, default: null})
    salesCount: number;

    @Column("varchar", {default: 'draft'})
    status: string;

    @Column("varchar", {nullable: true, default: null})
    lastTitleStep: string;

    @Column("varchar", {nullable: true, default: null})
    apartment: string;

    @Column("varchar", {nullable: true, default: null})
    chainTitleType: string;

    @Column("tinyint", {default: 0})
    certifiedByUser: boolean;

    @Column("varchar", {nullable: true, default: null})
    legalAddress: string;

    @Column("varchar", {nullable: true, default: null})
    tokenReportPdf: string;

    @Column("simple-json", {nullable: true, default: null})
    currentOwnerDeedList: {};

    @Column("datetime", {nullable: true, default: null})
    syncedAt: string;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;

    @ManyToOne(type => User)
    @JoinColumn({name: 'ownerId'})
    owner: User;

    @OneToOne(type => Location, location => location.title, {cascade: true})
    @JoinColumn({name: "locationId"})
    location: Location;

    @OneToMany(type => TitleBookPage, titleBookPage => titleBookPage.title)
    titleBookPages: TitleBookPage[];

    @OneToMany(type => TitleBuyer, titleBuyer => titleBuyer.title)
    titleBuyers: TitleBuyer[];

    @OneToMany(type => TitleSeller, titleSeller => titleSeller.title)
    titleSellers: TitleSeller[];

    @OneToMany(type => Deed, deed => deed.title)
    deedList: Deed[];

    @OneToMany(type => Easement, easement => easement.title)
    easementList: Easement[];

    @OneToMany(type => Lien, lien => lien.title)
    lienList: Lien[];

    @OneToMany(type => Mortgage, mortgage => mortgage.title)
    mortgageList: Mortgage[];

    @OneToMany(type => MiscCivilProbate, miscCivilProbate => miscCivilProbate.title)
    miscCivilProbateList: MiscCivilProbate[];

    @OneToMany(type => PlatFloorPlan, platFloorPlan => platFloorPlan.title)
    platFloorPlanList: PlatFloorPlan[];

    @OneToMany(type => Tax, tax => tax.title)
    taxList: Tax[];

    @OneToOne(type => Customer, customer => customer.title)
    @JoinColumn({name: "initialCustomer"})
    customer: Customer;

    @Column("varchar", {nullable: true, default: null})
    mainInvoice: string;

    @OneToOne(type => TitleDetail, titleDetail => titleDetail.title)
    titleDetail: TitleDetail;

    constructor() {
        super();
    }
}
