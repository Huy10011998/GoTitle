import {
    Column,
    Entity, PrimaryGeneratedColumn,
} from "typeorm";

@Entity("sync_queue")
export class SyncQueue {
    @PrimaryGeneratedColumn()
    id: number;

    @Column("int")
    objId: string;

    @Column("varchar", {nullable: true, default: null})
    uri: string;

    @Column("varchar", {nullable: true, default: null})
    type: string;

    @Column("varchar", {nullable: true, default: null})
    entity: string;
}
