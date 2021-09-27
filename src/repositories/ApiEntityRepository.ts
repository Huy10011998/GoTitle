import {ENDPOINT} from 'react-native-dotenv';
import {
    EntityRepository, FindConditions, Repository,
} from "typeorm";
import {ApiEntity} from "src/entities/index";
import moment from "moment";

@EntityRepository(ApiEntity)
export class ApiEntityRepository<ApiEntity> extends Repository<ApiEntity> {
    apiRoute: string;

    constructor() {
        super();
        this.apiRoute;
    }
    getRequestConfig(localEntity, relations=[]) {
        if (!this.apiRoute) {
            return null;
        }
        let requestConfig ={
            "getAll": {
                url: ENDPOINT + '/api/' + this.apiRoute,
                method: 'GET',
                params: {
                    offset: 0,
                    limit: 1000
                }
            },
            "post": {
                url: ENDPOINT + '/api/' + this.apiRoute,
                method: 'POST',
                fileUpload: false
            },
        };

        if (localEntity && localEntity.apiId) {
            requestConfig['get'] = {
                url: ENDPOINT + '/api/' + this.apiRoute + '/' + localEntity.apiId,
                method: 'GET',
            };
            requestConfig["put"] = {
                url: ENDPOINT + '/api/' + this.apiRoute + '/' +localEntity.apiId,
                method: 'PUT',
                fileUpload: false
            };
            requestConfig["delete"] = {
                url: ENDPOINT + '/api/' + this.apiRoute + '/' +localEntity.apiId,
                method: 'DELETE'
            };
        }
        return requestConfig;
    }

    getRequestConfigItem(key, localEntity = null, relations=[]) {
        let requestConfig = this.getRequestConfig(localEntity, relations);
        if (requestConfig && requestConfig[key]) {
            return requestConfig[key];
        } else {
            return null;
        }
    }

    findByApiId(apiId, options?): Promise<ApiEntity> {
        if (!options) {
            options = {}
        }
        options.where = {apiId};
        return this.findOne(options);
    }

    /**
     * Returns
     *  1: LocalData is newer, local data is kept
     *  -1: ApiData is newer, api data is kept in the local item
     *  0: Both are in sync, nothing to change
     *
     * @param localItem
     * @param apiData
     * @param relations
     * @param forceImport
     * @returns {number}
     */
    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        const ignoredAttrs = ['id', 'createdAt', 'updatedAt'];
        if (Array.isArray(localItem.ignoredApiAttrs)) {
            ignoredAttrs.concat(localItem.ignoredApiAttrs);
        }

        let res = 0;
        if(this.isApiDataNewer(apiData, localItem) || forceImport) {
            res = -1;
            (<any>Object).entries(apiData).forEach(([key, value]) => {
                if (ignoredAttrs.indexOf(key) !== -1) {
                    return;
                }
                if (typeof value === 'object' && value !== null) {
                    if (!Array.isArray(value) && value.hasOwnProperty('date') && value.hasOwnProperty('timezone')) {
                        // Parse a json Date
                        value = moment(value.date).toISOString();
                    } else {
                        // ignore the rest of objects
                        return;
                    }
                }

                if (typeof value !== 'undefined') {
                    localItem[key] = value;
                }
            });
            if (apiData.id) {
                localItem.apiId = apiData.id;
            }
            localItem.syncedAt = moment(apiData.updatedAt).toISOString();
        } else if (this.isLocalDataNewer(localItem, apiData)) {
            res = 1;
        }
        localItem.ignoreUpdateSyncedAt = true;

        return res;
    }

    /**
     * Method may be overwritten for more complex entities
     * @param localItem
     * @returns {}
     */
    exportApiData(localItem) {
        if (!localItem) {
            return null;
        }
        const ignoredAttrs = ['id', 'createdAt', 'updatedAt', 'syncedAt', 'apiRoute', 'apiId', 'apiReadOnly', 'ignoredLocalAttrs', 'ignoredApiAttrs', 'ignoreUpdateSyncedAt'];
        if (Array.isArray(localItem.ignoredLocalAttrs)) {
            ignoredAttrs.concat(localItem.ignoredLocalAttrs);
        }
        let apiData = {};
        (<any>Object).entries(localItem).forEach(([key, value]) => {
            //ignore ignoreAttrsList.
            if (ignoredAttrs.indexOf(key) !== -1) {
                return;
            }
            if (typeof value === 'object' && value !== null) {
                if (!Array.isArray(value) && (value.hasOwnProperty('date') && value.hasOwnProperty('timezone') || moment.isDate(value))) {
                    // Parse a json Date
                    value = moment(value).toISOString();
                } else {
                    // ignore the rest of objects
                    return;
                }
            }
            if (typeof value !== 'undefined') {
                apiData[key] = value;
            }
        });
        apiData['id'] = localItem.apiId;
        return apiData;
    }

    isLocalDataNewer(localItem, apiItem) {
        let res = false;
        if (!localItem.syncedAt) {
            res = true;
        } else {
            let localSyncedAt = moment(localItem.syncedAt);
            let apiUpdatedAt = moment(apiItem.updatedAt);
            res = localSyncedAt.isAfter(apiUpdatedAt);
        }
        return res;
    }

    isApiDataNewer(apiItem, localItem) {
        let res = false;
        if (!localItem.syncedAt) {
            res = true;
        } else {
            let localSyncedAt = moment(localItem.syncedAt);
            let apiUpdatedAt = moment(apiItem.updatedAt);
            res = apiUpdatedAt.isAfter(localSyncedAt);
        }
        return res;
    }
}