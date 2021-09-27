import {EntityRepository, RemoveOptions, Repository} from "typeorm";
import {User} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(User)
export class UserRepository extends ApiEntityRepository<User> {
}