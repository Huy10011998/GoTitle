import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, RemoveOptions, Repository} from "typeorm";
import {TitleBuyer} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(TitleBuyer)
export class TitleBuyerRepository extends ApiEntityRepository<TitleBuyer> {


    constructor() {
        super();
        this.apiRoute = 'title-buyers';
    }

    getAllByTitle(title): Promise<TitleBuyer[]> {
        return this.createQueryBuilder('tb')
            .where('tb.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getRequestConfig(localEntity, relations = []) {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-buyers';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-buyers';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-buyers/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-buyers/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-buyers/' + localEntity.apiId;
        }
        return requestConfig;
    }


    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        return res;
    }
}