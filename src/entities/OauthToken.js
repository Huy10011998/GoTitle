import {
    Column,
    CreateDateColumn,
    Entity,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";

@Entity("oauth_tokens")
export class OauthToken {

    @Column("varchar", {primary: true})
    access_token: string;

    @Column("varchar", {nullable: true, default: null})
    expires_in: string;

    @Column("varchar", {nullable: true, default: null})
    refresh_token: string;

    @Column("varchar", {nullable: true, default: null})
    token_type: string;

    @Column("varchar", {nullable: true, default: null})
    username: string;

    @CreateDateColumn()
    created_at: string;

    @UpdateDateColumn()
    updated_at: string;

    @Column("datetime", {nullable: true, default: null})
    expired_at: string;
}
