import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {Easement} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {DeedTypeRepository} from "./DeedTypeRepository";

@EntityRepository(Easement)
export class EasementRepository extends ApiEntityRepository<Easement> {

    deedTypeRepository: DeedTypeRepository;

    constructor() {
        super();
        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.apiRoute = 'easements';
    }

    getRequestConfig(localEntity, relations = []) {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/easements';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/easements';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/easements/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/easements/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/easements/' + localEntity.apiId;
        }
        return requestConfig;
    }

    exportApiData(localItem) {
        console.log('exportApiData Easement');
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
        console.log('importApiData Easement');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        console.log('Easement res: ' + res);
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
            console.log('Easement res: ' + res);
        }

        return res;
    }

    getAllByTitle(title): Promise<Easement[]> {
        return this.createQueryBuilder('e')
            .leftJoinAndSelect('e.deedType', 'dt', 'e.deedTypeId = dt.id')
            .where('e.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getAllByDeedType(deedType): Promise<Easement[]> {
        return this.createQueryBuilder('e')
            .leftJoinAndSelect('e.deedType', 'dt', 'e.deedTypeId = dt.id')
            .where('e.deedTypeId = :deedTypeId', {deedTypeId: deedType.id}).getMany();
    }
}