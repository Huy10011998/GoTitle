import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, DeepPartial, SaveOptions} from "typeorm";
import {Deed, DeedType} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {DeedTypeRepository} from "./DeedTypeRepository";

@EntityRepository(Deed)
export class DeedRepository extends ApiEntityRepository<Deed> {

    deedTypeRepository: DeedTypeRepository;

    constructor() {
        super();
        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.apiRoute = 'deeds';
    }

    getRequestConfig(localEntity, relations = []) {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/deeds';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/deeds';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/deeds/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/deeds/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/deeds/' + localEntity.apiId;
        }
        return requestConfig;
    }

    getAllByTitle(title): Promise<Deed[]> {
        return this.createQueryBuilder('d')
            .leftJoinAndSelect('d.deedType', 'dt', 'd.deedTypeId = dt.id')
            .where('d.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getAllByDeedType(deedType): Promise<Deed[]> {
        return this.createQueryBuilder('d')
            .leftJoinAndSelect('d.deedType', 'dt', 'd.deedTypeId = dt.id')
            .where('d.deedTypeId = :deedTypeId', {deedTypeId: deedType.id}).getMany();
    }

    exportApiData(localItem) {
        console.log('exportApiData Deed');
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
        console.log('importApiData Deed');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        console.log('Deed res: ' + res);
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
            console.log('Deed res: ' + res);
        }

        return res;
    }

    async save<T extends DeepPartial<DeedType>>(entity: T, options?: SaveOptions): Promise<T> {
        if (entity.deedType) {
            await this.deedTypeRepository.save(entity.deedType)
        }
        let res = await super.save(entity, options);
        return res;
    }
}