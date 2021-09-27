import {ENDPOINT} from 'react-native-dotenv';
import {DeepPartial, EntityRepository, RemoveOptions, Repository, SaveOptions} from "typeorm";
import {
    DbImage,
    Mortgage,
    Deed,
    Lien,
    PlatFloorPlan,
    Easement,
    MiscCivilProbate,
    Tax,
    Covenant
} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {Platform} from 'react-native';
import {generateCompletePathHomeImages} from 'src/utils/FileStorage';

@EntityRepository(DbImage)
export class DbImageRepository extends ApiEntityRepository<DbImage> {

    getAllByTitle(title): Promise<DbImage[]> {
        return this.createQueryBuilder('e')
            .leftJoinAndSelect('e.deedType', 'dt', 'e.deedTypeId = dt.id')
            .where('e.titleId = :titleId', {titleId: title.id}).getMany();
    }

    getAllByDeed(deed): Promise<DbImage[]> {
        return this.createQueryBuilder('i')
            .leftJoin('deed_db_images', 'ri')
            .where('ri.deedId = :deedId', {deedId: deed.id}).getMany();
    }

    getRequestConfig(localEntity, relations = []): any {
        // relations[0] => Document => Mortgage | Deed | Lien | Plat Floor | Easement | Misc | Tax | Covenant
        let documentRoute;
        if (relations.length == 0) {
            return null;
        }

        if (relations[0] instanceof Mortgage) documentRoute = 'mortgages';
        else if (relations[0] instanceof Deed) documentRoute = 'deeds';
        else if (relations[0] instanceof Lien) documentRoute = 'liens';
        else if (relations[0] instanceof PlatFloorPlan) documentRoute = 'plat-floor-plans';
        else if (relations[0] instanceof Easement) documentRoute = 'easements';
        else if (relations[0] instanceof MiscCivilProbate) documentRoute = 'misc-civil-probates';
        else if (relations[0] instanceof Tax) documentRoute = 'taxs';
        else if (relations[0] instanceof Covenant) documentRoute = 'covenants';

        this.apiRoute = documentRoute;
        let requestConfig = super.getRequestConfig(localEntity, relations);

        requestConfig['getAll'].url = ENDPOINT + '/api/' + documentRoute + '/' + relations[0].apiId + '/images';

        requestConfig['post'].url = ENDPOINT + '/api/' + documentRoute + '/' + relations[0].apiId + '/images';
        requestConfig['post'].fileUpload = true;

        if (localEntity && localEntity.apiId) {
            requestConfig['get'].url = ENDPOINT + '/api/' + documentRoute + '/' + relations[0].apiId + '/images/' + localEntity.apiId;

            requestConfig['put'].url = ENDPOINT + '/api/' + documentRoute + '/' + relations[0].apiId + '/images/' + localEntity.apiId;
            requestConfig['put'].method = 'POST';
            requestConfig['put'].fileUpload = true;

            requestConfig['delete'].url = ENDPOINT + '/api/' + documentRoute + '/' + relations[0].apiId + '/images/' + localEntity.apiId;
        }

        return requestConfig;
    }

    exportApiData(localItem): any | {} {
        let apiData = super.exportApiData(localItem);
        //The apiData will be used as FormData for the request
        let imageUri = (Platform.OS === 'android') ? localItem.imageData.uri : localItem.imageData.uri.replace('file://', '');
        apiData['image'] = {
            uri: imageUri,
            name: localItem.name,
            filename: localItem.name,
            type: 'image/' + localItem.imageData.mimeType.replace('image/', '')
        };
        return apiData;
    }

    async importApiData(localItem, apiData, relations = [], forceImport = false): Promise<number> {
        // relations[0] => Document => Mortgage | Deed | Lien | Plat Floor | Easement | Misc | Tax | Covenant
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.imageData = {
                ...apiData.imageData
            };
            localItem.name = apiData.originalName;

            let localUri = '';
            if (relations.length > 0 && relations[0] != null) {
                let document = relations[0];
                localUri = ((Platform.OS === 'android') ? 'file://' : '') + generateCompletePathHomeImages(document.title);
                if (document instanceof Deed) {
                    localUri += 'deed';
                }
                if (document instanceof Mortgage) {
                    localUri += 'mortgage';
                }
                if (document instanceof Lien) {
                    localUri += 'lien';
                }
                if (document instanceof PlatFloorPlan) {
                    localUri += 'platFloorPlan';
                }
                if (document instanceof Easement) {
                    localUri += 'easement';
                }
                if (document instanceof MiscCivilProbate) {
                    localUri += 'miscCivilProbate';
                }
                if (document instanceof Tax) {
                    localUri += 'tax';
                }
                if (document instanceof Covenant) {
                    if (document.deedType && document.deedType.scope == 'secondary') {
                        localUri += 'covenant/' + document.deedType.code;
                    } else
                        localUri += 'covenant';
                }
            }
            localItem.imageData.uri = localUri + '/' + localItem.imageData.originalName.split('.')[0] + '.png';
            localItem.imageData.mimeType = 'png';
        }
        return res;
    }


    save<T extends DeepPartial<DbImage>>(entity: T, options?: SaveOptions): Promise<T> {
        if(!options){
            options = {};
        }
        options.reload = true;
        return super.save(entity, options);
    }
}