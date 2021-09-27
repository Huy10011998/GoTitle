import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    RelationId,
    UpdateDateColumn,
} from "typeorm";
import {ApiEntity} from "./ApiEntity";

@Entity("users")
export class User extends ApiEntity {

    @PrimaryGeneratedColumn()
    id: number;

    @Column("int", {nullable: true, default: null})
    apiId: number;

    @Column("varchar")
    name: string;

    @Column("varchar")
    lastName: string;

    @Column("varchar", {nullable: true})
    email: string;

    @Column("datetime", {nullable: true})
    lastLogin: string;

    @Column("datetime", {nullable: true})
    lastActive: string;

    @Column("text", {nullable: true})
    profileImage: string;

    @Column("integer", )
    emailNotificationsActive: number;

    @Column("varchar",{nullable: true})
    password: string;

    @Column("varchar", {nullable: true})
    rememberToken: string;

    @Column("varchar", {nullable: true})
    stripeId: string;

    @Column("varchar", {nullable: true})
    cardBrand: string;

    @Column("varchar", {nullable: true})
    cardLastFour: string;

    @Column("date", {nullable: true})
    trialEndsAt: string;

    @Column("integer", {nullable: true})
    profileId: number;

    @Column("integer", {nullable: true})
    userSettingId: number;

    @CreateDateColumn()
    createdAt: string;

    @UpdateDateColumn()
    updatedAt: string;
}
