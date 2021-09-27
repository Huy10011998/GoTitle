import {EntityRepository, RemoveOptions, Repository} from "typeorm";
import {Location} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(Location)
export class LocationRepository extends ApiEntityRepository<Location> {

    getByTitle(title): Promise<Location[]> {
        return this.createQueryBuilder('l')
            .leftJoin('titles', 't', 't.locationId = l.id')
            .where('t.id = :titleId', {titleId: title.id}).getOne();
    }
}