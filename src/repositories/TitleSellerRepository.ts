import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {TitleSeller} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(TitleSeller)
export class TitleSellerRepository extends ApiEntityRepository<TitleSeller> {

    constructor() {
        super();
        this.apiRoute = 'title-sellers';
    }

    getAllByTitle(title): Promise<TitleSeller[]> {
        return this.createQueryBuilder('ts')
            .where('ts.titleId = :titleId', {titleId: title.id}).getMany();
    }


    getRequestConfig(localEntity, relations = []) {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-sellers';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-sellers';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-sellers/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-sellers/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-sellers/' + localEntity.apiId;
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