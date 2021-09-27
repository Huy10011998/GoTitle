import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {Customer} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(Customer)
export class CustomerRepository extends ApiEntityRepository<Customer> {

    getRequestConfig(localEntity, relations = []) {
        let requestConfig ={
            "getAll": {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/customer',
                method: 'GET'
            },
            "post": {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/customer',
                method: 'POST'
            },
        };

        if (localEntity && localEntity.apiId) {
            requestConfig['get'] = {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/customer',
                method: 'GET',
            };
            requestConfig["put"] = {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/customer',
                method: 'POST'
            };
            requestConfig["delete"] = {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/customer',
                method: 'DELETE'
            };
        }
        return requestConfig;
    }

    getByTitle(title): Promise<Customer[]> {
        return this.createQueryBuilder('c')
            .leftJoin('titles', 't', 't.initialCustomer = c.id')
            .where('t.id = :titleId', {titleId: title.id}).getOne();
    }

}