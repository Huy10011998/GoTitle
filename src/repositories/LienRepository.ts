import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {Lien} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {DeedTypeRepository} from "./DeedTypeRepository";


@EntityRepository(Lien)
export class LienRepository extends ApiEntityRepository<Lien> {

    deedTypeRepository: DeedTypeRepository;

    constructor() {
        super();
        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.apiRoute = 'liens';
    }

    getRequestConfig(localEntity, relations = []) {
        // relations[0] => Title
        // relations[1] => MasterDocument
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/liens';
        requestConfig.post['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/liens';

        if (localEntity && localEntity.apiId) {
            requestConfig.get['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/liens/' + localEntity.apiId;
            requestConfig.put['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/liens/' + localEntity.apiId;
            requestConfig.delete['url'] = ENDPOINT + '/api/title/' + relations[0].apiId + '/liens/' + localEntity.apiId;
        }

        let masterDocument = null;
        if (localEntity && localEntity.masterDocument) {
            masterDocument = localEntity.masterDocument;
        } else if (relations.length >= 2 && relations[1] && relations[1] instanceof Lien) {
            masterDocument = relations[1];
        }

        if (masterDocument && masterDocument.apiId) {
            requestConfig.getAll['url'] = ENDPOINT + '/api/lien/' + masterDocument.apiId + '/secondary-docs';
            requestConfig.post['url'] = ENDPOINT + '/api/lien/' + masterDocument.apiId + '/secondary-docs';

            if (localEntity && localEntity.apiId) {
                requestConfig.get['url'] = ENDPOINT + '/api/lien/' + masterDocument.apiId + '/secondary-docs/' + localEntity.apiId;
                requestConfig.put['url'] = ENDPOINT + '/api/lien/' + masterDocument.apiId + '/secondary-docs/' + localEntity.apiId;
                requestConfig.delete['url'] = ENDPOINT + '/api/lien/' + masterDocument.apiId + '/secondary-docs/' + localEntity.apiId;
            }
        }

        return requestConfig;
    }

    exportApiData(localItem) {
        console.log('exportApiData Liens');
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
        console.log('importApiData Liens');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        console.log('Liens res: ' + res);

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
            console.log('Lien DeedType res: ' + res);
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
            console.log('Lien masterDocument res: ' + res);
        }


        return res;
    }

    getAllByTitle(title): Promise<Lien[]> {
        return this.createQueryBuilder('l')
            .leftJoinAndSelect('l.deedType', 'dt', 'l.deedTypeId = dt.id')
            .where('l.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getAllByDeedType(deedType): Promise<Lien[]> {
        return this.createQueryBuilder('l')
            .leftJoinAndSelect('l.deedType', 'dt', 'l.deedTypeId = dt.id')
            .where('l.deedTypeId = :deedTypeId', {deedTypeId: deedType.id}).getMany();
    }

    getAllMasterByTitle(title): Promise<Lien[]> {
        return this.createQueryBuilder('l')
            .leftJoinAndSelect('l.deedType', 'dt', 'l.deedTypeId = dt.id')
            .where('l.titleId = :titleId', {titleId: title.id}).andWhere('l.masterDocumentId is null').getMany();
    }

    getAllByMaster(lien): Promise<Lien[]> {
        return this.createQueryBuilder('l')
            .leftJoinAndSelect('l.deedType', 'dt', 'l.deedTypeId = dt.id')
            .where('l.masterDocumentId = :masterDocumentId', {masterDocumentId: lien.id}).getMany();
    }

    async remove(lien, options?: RemoveOptions): Promise<Lien> {
        if (!Array.isArray(lien)) {
            let childLienList = await this.getAllByMaster(lien);
            if (childLienList.length > 0) {
                await super.remove(childLienList);
            }
        }
        return super.remove(lien, options);
    }
}