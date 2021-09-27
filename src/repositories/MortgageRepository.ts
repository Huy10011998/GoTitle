import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {Mortgage} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {DeedTypeRepository} from "./DeedTypeRepository";

@EntityRepository(Mortgage)
export class MortgageRepository extends ApiEntityRepository<Mortgage> {

    deedTypeRepository: DeedTypeRepository;

    constructor() {
        super();
        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.apiRoute = 'mortgages';
    }

    getRequestConfig(localEntity, relations = []) {
        // relations[0] => Title
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/mortgages';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/mortgages';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/mortgages/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/mortgages/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/mortgages/' + localEntity.apiId;
        }

        let masterDocument = null;
        if (localEntity && localEntity.masterDocument) {
            masterDocument = localEntity.masterDocument;
        } else if (relations.length >= 2 && relations[1] && relations[1] instanceof Mortgage) {
            masterDocument = relations[1];
        }

        if (masterDocument && masterDocument.apiId) {
            requestConfig.getAll['url'] = ENDPOINT + '/api/mortgage/' + masterDocument.apiId + '/secondary-docs';
            requestConfig.post['url'] = ENDPOINT + '/api/mortgage/' + masterDocument.apiId + '/secondary-docs';

            if (localEntity && localEntity.apiId) {
                requestConfig.get['url'] = ENDPOINT + '/api/mortgage/' + masterDocument.apiId + '/secondary-docs/' + localEntity.apiId;
                requestConfig.put['url'] = ENDPOINT + '/api/mortgage/' + masterDocument.apiId + '/secondary-docs/' + localEntity.apiId;
                requestConfig.delete['url'] = ENDPOINT + '/api/mortgage/' + masterDocument.apiId + '/secondary-docs/' + localEntity.apiId;
            }
        }

        return requestConfig;
    }

    exportApiData(localItem) {
        console.log('exportApiData Mortgage');
        let apiData = super.exportApiData(localItem);
        if (localItem.deedType !== undefined) {
            if (localItem.deedType != null) {
                apiData['deedType'] = this.deedTypeRepository.exportApiData(localItem.deedType);
            } else {
                apiData['deedType'] = null;
            }
        }
        if (localItem.masterDocument !== undefined) {
            if (localItem.masterDocument != null) {
                apiData['masterDocument'] = this.exportApiData(localItem.masterDocument);
            } else {
                apiData['masterDocument'] = null;
            }
        }
        return apiData;
    }

    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        // TypeORM returns undefined when the relation has not been loaded. And NULL when the relation has been loaded with no result.
        console.log('importApiData Mortgage');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        console.log('Mortgage res: ' + res);

        // sync deedType / not embedded
        let newDeedType;
        if (localItem.deedType !== undefined || !localItem.id) {
            if (apiData.deedType || localItem.deedType) {
                if (!apiData.deedType) {
                    if (res === 0) res = 1;
                } else {
                    if (!localItem.deedType || localItem.deedType.apiId != apiData.deedType.id) {
                        newDeedType = await this.deedTypeRepository.findByApiId(apiData.deedType.id);
                        if (newDeedType) {
                            localItem.deedType = newDeedType;
                        } else {
                            newDeedType = this.deedTypeRepository.create();
                            await this.deedTypeRepository.importApiData(newDeedType, apiData.deedType, [], forceImport);
                            await this.deedTypeRepository.save(newDeedType);
                            localItem.deedType = newDeedType;
                        }
                        if (res === 0) res = -1;
                    }
                }
            }
            console.log('Mortgage DeedType res: ' + res);
        }

        // sync masterDocument / not embedded
        let newMasterDocument;
        if (localItem.masterDocument !== undefined || !localItem.id) {
            if (apiData.masterDocument || localItem.masterDocument) {
                if (!apiData.masterDocument) {
                    if (res === 0) res = 1;
                } else {
                    if (!localItem.masterDocument || localItem.masterDocument.apiId != apiData.masterDocument.id) {
                        newMasterDocument = await this.findByApiId(apiData.masterDocument.id);
                        if (newMasterDocument) {
                            localItem.masterDocument = newMasterDocument;
                        } else {
                            newMasterDocument = this.create();
                            await this.importApiData(newMasterDocument, apiData.masterDocument, [], forceImport);
                            await this.save(newMasterDocument);
                            localItem.masterDocument = newMasterDocument;
                        }
                        if (res === 0) res = -1;
                    }
                }
            }
            console.log('Mortgage masterDocument res: ' + res);
        }

        return res;
    }


    getAllByTitle(title): Promise<Mortgage[]> {
        return this.createQueryBuilder('m')
            .leftJoinAndSelect('m.deedType', 'dt', 'm.deedTypeId = dt.id')
            .where('m.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getAllByDeedType(deedType): Promise<Mortgage[]> {
        return this.createQueryBuilder('m')
            .leftJoinAndSelect('m.deedType', 'dt', 'm.deedTypeId = dt.id')
            .where('m.deedTypeId = :deedTypeId', {deedTypeId: deedType.id}).getMany();
    }

    getAllMasterByTitle(title): Promise<Mortgage[]> {
        return this.createQueryBuilder('m')
            .leftJoinAndSelect('m.deedType', 'dt', 'm.deedTypeId = dt.id')
            .where('m.titleId = :titleId', {titleId: title.id}).andWhere('m.masterDocumentId is null').getMany();
    }

    getAllByMaster(mortgage): Promise<Mortgage[]> {
        return this.createQueryBuilder('m')
            .leftJoinAndSelect('m.deedType', 'dt', 'm.deedTypeId = dt.id')
            .where('m.masterDocumentId = :masterDocumentId', {masterDocumentId: mortgage.id}).getMany();
    }


    async remove(mortgage, options?: RemoveOptions): Promise<Mortgage> {
        if (!Array.isArray(mortgage)) {
            let childMortgageList = await this.getAllByMaster(mortgage);
            if (childMortgageList.length > 0) {
                await super.remove(childMortgageList);
            }
        }
        return super.remove(mortgage, options);
    }
}