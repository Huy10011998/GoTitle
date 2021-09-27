import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {Tax} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {DeedTypeRepository} from "./DeedTypeRepository";

@EntityRepository(Tax)
export class TaxRepository extends ApiEntityRepository<Tax> {

    deedTypeRepository: DeedTypeRepository;

    constructor() {
        super();
        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.apiRoute = 'taxs';
    }

    getRequestConfig(localEntity, relations = []) {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/taxs';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/taxs';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/taxs/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/taxs/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/taxs/' + localEntity.apiId;
        }
        return requestConfig;
    }

    exportApiData(localItem) {
        console.log('exportApiData Tax');
        let apiData = super.exportApiData(localItem);
        if (localItem.deedType !== undefined) {
            if (localItem.deedType != null) {
                apiData['deedType'] = this.deedTypeRepository.exportApiData(localItem.deedType);
            } else {
                apiData['deedType'] = null;
            }
        }
        return apiData;
    }

    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        // TypeORM returns undefined when the relation has not been loaded. And NULL when the relation has been loaded with no result.
        console.log('importApiData Tax');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        console.log('Tax res: ' + res);
        // sync deedType
        if (localItem.deedType !== undefined || !localItem.id) {
            if (apiData.deedType || localItem.deedType) {
                if (!apiData.deedType) {
                    if (res === 0) res = 1;
                } else {
                    if (!localItem.deedType) {
                        let newDeedType = await this.deedTypeRepository.findByApiId(apiData.deedType.id);
                        if (newDeedType) {
                            localItem.deedType = newDeedType;
                        } else {
                            localItem.deedType = this.deedTypeRepository.create();
                            await this.deedTypeRepository.importApiData(localItem.deedType, apiData.deedType, [], forceImport);
                        }
                        if (res === 0) res = -1;
                    } else {
                        if (localItem.deedType.apiId == apiData.deedType.id) {
                            let tmpRes = await this.deedTypeRepository.importApiData(localItem.deedType, apiData.deedType, [], forceImport);
                            if (res === 0) res = tmpRes;
                        } else {
                            let newDeedType = await this.deedTypeRepository.findByApiId(apiData.deedType.id);
                            if (newDeedType) {
                                localItem.deedType = newDeedType;
                            } else {
                                localItem.deedType = this.deedTypeRepository.create();
                                await this.deedTypeRepository.importApiData(localItem.deedType, apiData.deedType, [], forceImport);
                            }
                            if (res === 0) res = -1;
                        }
                    }
                }
            }
            console.log('Tax res: ' + res);
        }

        return res;
    }

    getAllByTitle(title): Promise<Tax[]> {
        return this.createQueryBuilder('t')
            .leftJoinAndSelect('t.deedType', 'dt', 't.deedTypeId = dt.id')
            .where('t.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getAllByDeedType(deedType): Promise<Tax[]> {
        return this.createQueryBuilder('t')
            .leftJoinAndSelect('t.deedType', 'dt', 't.deedTypeId = dt.id')
            .where('t.deedTypeId = :deedTypeId', {deedTypeId: deedType.id}).getMany();
    }
}