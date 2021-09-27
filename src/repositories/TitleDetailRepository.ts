import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, RemoveOptions, Repository} from "typeorm";
import {TitleDetail} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

@EntityRepository(TitleDetail)
export class TitleDetailRepository extends ApiEntityRepository<TitleDetail> {

    getByTitle(title): Promise<TitleDetail[]> {
        return this.createQueryBuilder('d')
            .where('d.titleId = :titleId', {titleId: title.id}).getOne();
    }

    getRequestConfig(localEntity, relations = []) {
        let requestConfig ={
            "getAll": {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/detail',
                method: 'GET'
            },
            "post": {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/detail',
                method: 'POST'
            },
        };

        if (localEntity && localEntity.apiId) {
            requestConfig['get'] = {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/detail/' + localEntity.apiId,
                method: 'GET',
            };
            requestConfig["put"] = {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/detail/' + localEntity.apiId,
                method: 'PUT'
            };
            requestConfig["delete"] = {
                url: ENDPOINT + '/api/title/' + relations[0].apiId+'/detail/' + localEntity.apiId,
                method: 'DELETE'
            };
        }
        return requestConfig;
    }

    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        localItem.hasRealState = (localItem.hasRealState == null)? false: localItem.hasRealState;
        localItem.clientPrice = (localItem.clientPrice == null)? 0: localItem.clientPrice;
        localItem.searchTypeTaxInformationRequest = (localItem.searchTypeTaxInformationRequest == null)? false: localItem.searchTypeTaxInformationRequest;
        localItem.hasCivil = (localItem.hasCivil == null)? false: localItem.hasCivil;
        localItem.hasProbateEstate = (localItem.hasProbateEstate == null)? false: localItem.hasProbateEstate;
        localItem.hasLiens = (localItem.hasLiens == null)? false: localItem.hasLiens;
        localItem.hasTaxes = (localItem.hasTaxes == null)? false: localItem.hasTaxes;
        localItem.isOpenSection = (localItem.isOpenSection == null)? false: localItem.isOpenSection;
        return res;
    }
}