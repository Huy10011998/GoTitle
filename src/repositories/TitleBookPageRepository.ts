import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, RemoveOptions, Repository} from "typeorm";
import {TitleBookPage} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(TitleBookPage)
export class TitleBookPageRepository extends ApiEntityRepository<TitleBookPage> {

    constructor() {
        super();
        this.apiRoute = 'title-book-page';
    }

    getAllByTitle(title): Promise<TitleBookPage[]> {
        return this.createQueryBuilder('b')
            .where('b.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getRequestConfig(localEntity, relations = []) {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-book-page';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-book-page';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-book-page/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-book-page/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/title-book-page/' + localEntity.apiId;
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