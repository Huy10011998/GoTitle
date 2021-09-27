import React, {Component} from 'react';
import {ENDPOINT, SYNCHRONIZE_FLAG} from 'react-native-dotenv';
import NetInfo from "@react-native-community/netinfo";
import {Platform} from 'react-native';

import {getManager, getConnection} from "typeorm";
import {SyncQueue, DbImage} from "src/entities/index";

import RNFetchBlob from 'rn-fetch-blob';
import {requestPermission} from 'src/utils/Permission';

import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";
import {ServerError} from "../utils/ServerError";

export const TYPE_STORE = 'store';
export default class SyncService {
    constructor() {
        console.log('SyncService');
        this.connection = getConnection();
        this.manager = getManager();
        this.token = undefined;
        this.platformOS = Platform.OS;
        requestPermission.all().then((permissionDeniedList) => {

        }).catch((err) => {
            console.warn(err);
        });
    }

    async getToken() {
        if (!this.token) {
            await AsyncStorage.getItem('user-token').then((userToken) => {
                this.token = userToken;
            });
        }
        return this.token;
    }

    /**
     *
     * @param repository
     * @param localItem
     * @param relations
     * @returns {Promise.<void>}
     */
    async syncItem(repository, localItem, relations = []) {
        console.log("Sync Item");
        let isConnected = false;
        let apiItem = null;
        let removeApi = false;
        let removeLocal = false;
        await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);
        let successPull = true;
        if (isConnected) {
            if (localItem.apiId) {
                // have API id
                // get API Item
                let requestConfig = repository.getRequestConfigItem('get', localItem, relations);
                if (!requestConfig || !requestConfig.method || !requestConfig.url) {
                    //no request configuration found, terminate sync.
                    return;
                }
                let apiResponse = await this.apiRequest(requestConfig.method, requestConfig.url, requestConfig.params);
                if (!apiResponse.status || (apiResponse.errors && apiResponse.errors.length == 0)) {
                    // merge data
                    if (apiResponse.results.length > 0) {
                        apiItem = apiResponse.results[0];
                    } else {
                        removeLocal = true;
                    }
                } else {
                    if (apiResponse.status == 404) {
                        removeLocal = true;
                    } else {
                        let serverError = new ServerError(apiResponse);
                        console.warn(serverError);
                        successPull = false;
                    }
                }
            }
            if (successPull) {
                await this.syncMerge(repository, localItem, apiItem, removeLocal, removeApi, relations).catch(err => Promise.reject(err));
            }
        }
    }

    /**
     *
     * @param repository
     * @param localItemList
     * @param relations
     * @returns {Promise.<*>}
     */
    async syncList(repository, localItemList, relations = []) {
        console.log("Sync List");
        let isConnected = false;
        await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);
        if (!localItemList) {
            localItemList = [];
        }
        if (isConnected) {
            let requestConfig = repository.getRequestConfigItem('getAll', null, relations);
            if (requestConfig) {
                let apiResponse = await this.apiRequest(requestConfig.method, requestConfig.url, requestConfig.params);
                let apiItemList = [];
                if (!apiResponse.status || (apiResponse.errors && apiResponse.errors.length == 0)) {
                    apiItemList = apiResponse.results;
                    /**
                     * 1. Find the items that do not have apiID. Push them as these are new local Items.
                     * 2. Find the items that have apiId and have apiItem with the same id. Merge them
                     * 3. Find the items that have apiId and don't have apiItem. Remove local item. API was removed.
                     * 4. Iterate over the apiItems that are left. These are new API items that are not in local.
                     */
                    for (let i = localItemList.length - 1; i >= 0; i--) {
                        if (!localItemList[i].apiId) {
                            // push local item to production
                            await this.syncMerge(repository, localItemList[i], null, false, false, relations).catch(err=> console.warn('SyncList',err));
                        } else {
                            // Local item has apiId
                            let foundIndex = null;
                            // search for the associated api item
                            for (let j = 0; j < apiItemList.length; j++) {
                                if (localItemList[i].apiId == apiItemList[j].id) {
                                    foundIndex = j;
                                    break;
                                }
                            }
                            if (foundIndex !== null) {
                                // merge found apiItem with local Item
                                await this.syncMerge(repository, localItemList[i], apiItemList[foundIndex], false, false, relations).catch(err=> console.warn('SyncList',err));
                                apiItemList.splice(foundIndex, 1);
                            } else {
                                // remove local item, because api item was removed on server.
                                await this.syncMerge(repository, localItemList[i], null, true, false, relations).catch(err=> console.warn('SyncList',err));
                                localItemList.splice(i, 1);
                            }
                        }
                    }

                    // iterate over the rest of apiItemList not merged and create new local items for them.
                    for (let i = 0; i < apiItemList.length; i++) {
                        let deletedItem = await this.manager.findOne(SyncQueue, {
                            entity: repository.metadata.name,
                            objId: apiItemList[i].id
                        });
                        let apiItem = await this.syncMerge(repository, null, apiItemList[i], false, deletedItem != null, relations).catch(err => console.warn('SyncList', err));
                        if (deletedItem)
                            this.manager.remove(deletedItem);
                        if (apiItem)
                            localItemList.push(apiItem);
                    }
                } else {
                    console.warn(apiResponse.status + ' ' + apiResponse.message);
                }
            }
        }
        return localItemList;
    }

    /**
     * @param repository
     * @param apiItem
     * @param localItem
     * @param removeLocal
     * @param removeApi
     * @param relations
     * @returns {Promise.<void>}
     */
    async syncMerge(repository, localItem = null, apiItem = null, removeLocal = false, removeApi = false, relations = []) {
        console.log('Apply Sync');
        console.log('Remove Local', removeLocal);
        console.log('Remove API', removeApi);
        if (!apiItem) {
            if (removeLocal) {
                console.log('Remove Local Item');
                await repository.remove(localItem);
                localItem = null;
            } else {
                // create api Item
                console.log('Create api Item');
                let requestConfig = repository.getRequestConfigItem('post', localItem, relations);
                if (requestConfig && requestConfig.method && requestConfig.url) {
                    let apiResponse = await this.apiRequest(requestConfig.method, requestConfig.url, requestConfig.params, repository.exportApiData(localItem), requestConfig.fileUpload);
                    if (!apiResponse.status || (apiResponse.errors && apiResponse.errors.length == 0)) {
                        await repository.importApiData(localItem, apiResponse.results[0], relations, true);
                        await repository.save(localItem);
                    } else {
                        let serverError = new ServerError(apiResponse);
                        console.warn(serverError);
                    }
                }
            }
        } else if (!localItem) {
            if (removeApi) {
                console.log('remove API Item');
                let requestConfig = repository.getRequestConfigItem('delete', {apiId:apiItem.id}, relations);
                await this.apiRequest(requestConfig.method, requestConfig.url, requestConfig.params, null, false);
            } else {
                console.log('create Local Item');
                localItem = repository.create();
                await repository.importApiData(localItem, apiItem, relations, true);
                if (localItem instanceof DbImage) {
                    console.log("instance of DBImage");
                    if (localItem) {
                        await this.downloadImage(localItem);
                    }
                }
                await repository.save(localItem);
            }
        } else {
            // both exists merge items
            console.log('Merging local and api data');
            /**
             * -1 to save local only
             * 1 to push data to api an save local
             * 0 nothing to do
             */
            let res = await repository.importApiData(localItem, apiItem, relations, false);
            console.log('finalRes', res);
            if (res === 1) {
                // Local Data is newer. Upload to API first.
                console.log('Local Data is newer. Update API.');
                let requestConfig = repository.getRequestConfigItem('put', localItem, relations);
                if (requestConfig) {
                    let apiResponse = await this.apiRequest(requestConfig.method, requestConfig.url, requestConfig.params, repository.exportApiData(localItem), requestConfig.fileUpload);
                    if (!apiResponse.status || (apiResponse.errors && apiResponse.errors.length == 0)) {
                        apiItem = apiResponse.results[0];
                        res = await repository.importApiData(localItem, apiItem, relations, true);
                        console.log('res after push to api: ' + res);
                        await repository.save(localItem);
                    } else {
                        let serverError = new ServerError(apiResponse);
                        console.warn(serverError);
                        return Promise.reject(serverError);
                    }
                }
            } else if (res === -1) {
                console.log('API Data is newer. Update localItem.');
                await repository.save(localItem);
                if (localItem instanceof DbImage) {
                    console.log("instance of DBImage");
                    if (localItem) {
                        await this.downloadImage(localItem);
                    }
                }
            } else {
                console.log('Local Item is up to date');
            }
        }
        return localItem;
    }

    /**
     * TODO: FUNCTION TO REMOVE DUPLICATE LOCAL ITEMS
     * @param entity
     * @param apiId
     * @returns {Promise.<*>}
     */
    async removeDuplicateLocalItems(entity, apiId) {
        let items = await this.manager.find(entity, {apiId: apiId});
        let mainLocalItem = null;

        if (items.length > 0) {
            mainLocalItem = items[0];
        }

        if (items.length > 1) {
            // delete the rest of the items.
            for (let i = 0; i < items.length; i++) {
                if (items[i].id != mainLocalItem.id) {
                    await this.manager.remove(entity, items[i]);
                }
            }
        }
        return mainLocalItem;
    }

    /**
     *
     * @param method
     * @param url
     * @param requestParams
     * @param requestData
     * @param fileUpload
     * @returns {Promise.<*|Promise.<TResult>>}
     */
    async apiRequest(method, url, requestParams, requestData, fileUpload = false) {
        let paramString = '';
        if (!requestParams) {
            requestParams = {};
        }
        Object.entries(requestParams).forEach(([key, value]) => {
            paramString += key + '=' + value + '&';
        });

        if (paramString.length > 0) {
            paramString = paramString.slice(0, -1);
            url += '?' + paramString
        }
        let requestConfig = {
            method: method,
            headers: {
                'Accept': 'application/json',
                'Authorization': 'Bearer ' + await this.getToken()
            }
        };
        if (requestData) {
            if (!fileUpload) {
                requestConfig.body = JSON.stringify(requestData);
                requestConfig.headers['Content-Type'] = 'application/json';
            } else {
                let body = new FormData();
                Object.entries(requestData).forEach(([key, data]) => {
                    body.append(key, data);
                });
                requestConfig.body = body;
            }
        }

        return fetch(url, requestConfig)
            .then((response) => {
                if (response.status === 200)
                    return response.json();
                return response.json().then(data => {
                    return {
                        status: response.status,
                        message: data.message,
                        data: data
                    }
                });
            });
    }

    async downloadImage(localItem) {
        await this.getToken();
        await RNFetchBlob
            .config({
                path: localItem.imageData.uri.replace('file://', '')
            })
            .fetch('GET', localItem.imageData.url, {
                Authorization: 'Bearer ' + this.token
            })
            .then(async (res) => {
                console.log('Imagepath Downloaded ', res.path());
            })
            .catch((err) => {
                console.warn(err);
            });
    }

    async syncObject(localObj, uri, entityName, props) {
        console.log('syncObject');
        if (SYNCHRONIZE_FLAG == 'true') {

            let isConnected = false;
            await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

            let tmpLocalObj = await this.manager.findOne(entityName, localObj.id);
            if (tmpLocalObj !== null)
                localObj.apiId = tmpLocalObj.apiId;
            else {
                return;
            }

            let method = 'POST';
            if (localObj.apiId != null) {
                if (entityName.toLowerCase() != 'dbimage')
                    method = 'PUT';
                if (entityName !== 'Customer')
                    uri += '/' + localObj.apiId;
            }
            if (entityName == 'Customer') {
                method = 'POST';

            }

            let tmpObj = this.cleanObject(localObj);
            if (isConnected) {
                if (typeof this.token === 'undefined')
                    await this.getToken();
                if (!this.connection.isConnected)
                    await this.connection.connect();
                return await fetch(ENDPOINT + '/api/' + uri,
                    {
                        method: method,
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.token
                        },
                        body: JSON.stringify(tmpObj)
                    })
                    .then((response) => {
                        if (response.status === 200)
                            return response.json();
                        return response.json().then(json => Promise.reject({
                            status: response.status,
                            message: json
                        }));
                    })
                    .then(async (json) => {
                        for (let apiObj  of json.results) {
                            await this.processObject(apiObj, entityName, localObj);
                        }
                        return json;
                    }, error => {
                        if (error.status === 401 || error.status === 403) {
                            AsyncStorage.removeItem('user-token').then(async () => {
                                props.navigation.navigate('AuthNav')
                            });
                        }
                    })
            }
            // else {
            //
            //     return this.addSyncQueue(localObj.id, uri, 'store', entityName);
            // }
        }
    }

    async syncGetObject(obj, uri, entityName, props) {

        let isConnected = false;
        await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

        if (isConnected) {
            if (typeof this.token === 'undefined')
                await this.getToken();

            return await fetch(ENDPOINT + '/api/' + uri,
                {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + this.token
                    },
                })
                .then((response) => {
                    if (response.status === 200)
                        return response.json();
                    return response.json().then(json => Promise.reject({
                        status: response.status,
                        message: json,
                        class: entityName
                    }));
                })
                .then((json) => {
                    return json;
                }, error => {
                    if (error.status === 401 || error.status === 403) {
                        AsyncStorage.removeItem('user-token').then(async () => {
                            props.navigation.navigate('AuthNav')
                        });
                    }
                });
        }
    }

    async removeObject(uri, entityName, props) {
        if (SYNCHRONIZE_FLAG == 'true') {
            let isConnected = false;
            await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

            if (isConnected) {
                if (typeof this.token === 'undefined')
                    await this.getToken();

                if (!this.connection.isConnected)
                    await this.connection.connect();

                return await fetch(ENDPOINT + '/api/' + uri,
                    {
                        method: 'DELETE',
                        headers: {
                            'Accept': 'application/json',
                            'Authorization': 'Bearer ' + this.token
                        }
                    })
                    .then((response) => {
                        if (response.status === 200)
                            return response.json();
                        return response.json().then(json => Promise.reject({
                            status: response.status,
                            message: json
                        }));
                    })
                    .then((json) => {
                        return json;
                    }, error => {
                        if (error.status === 401 || error.status === 403) {
                            AsyncStorage.removeItem('user-token').then(async () => {
                                props.navigation.navigate('AuthNav')
                            });
                        }
                    });
            }

        }
    }

    async syncGetAll(uri, entityName, title = null, params = {}, props) {
        if (SYNCHRONIZE_FLAG == 'true') {
            let isConnected = false;
            await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

            if (isConnected) {
                if (this.token == null)
                    await this.getToken();

                if (!this.connection.isConnected)
                    await this.connection.connect();

                if (params == null) {
                    params = {};
                }
                if (entityName == 'Title')
                    params.source = 'gotitle';

                if (params.offset == null) {
                    params.offset = 0;
                }
                if (params.limit == null) {
                    params.limit = 100;
                }

                let paramString = '';
                Object.entries(params).forEach(([key, value]) => {
                    paramString += key + '=' + value + '&';
                });

                if (paramString.length > 0)
                    paramString = paramString.slice(0, -1);

                let url = ENDPOINT + '/api/' + uri + '?' + paramString;
                console.log(url);
                return await fetch(url,
                    {
                        method: 'GET',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer ' + this.token
                        }
                    })
                    .then((response) => {
                        if (response.status === 200)
                            return response.json();
                        return response.json().then(json => Promise.reject({
                            status: response.status,
                            message: json,
                            class: entityName
                        }));
                    })
                    .then(async (json) => {
                        for (let apiObj  of json.results) {
                            if (entityName.toLowerCase() === 'deedtype')
                                await this.processDeedType({...apiObj});
                            else
                                await this.processObject({...apiObj}, entityName, null, title);
                        }
                        return json.results;
                    }, error => {
                        if (error.status === 401 || error.status === 403) {
                            AsyncStorage.removeItem('user-token').then(async () => {
                                props.navigation.navigate('AuthNav')
                            });
                        }
                    })
            }
        }


    }

    async clearSyncQueue() {
        if (!this.connection.isConnected)
            await this.connection.connect();
        await this.manager.clear(SyncQueue);
        console.warn("Sync Queue cleared!");
    }

    cleanObject(localObj) {
        'strict';
        let tmpObj = {...localObj};
        if (tmpObj.apiId != null) {
            tmpObj.id = tmpObj.apiId;
        } else {
            delete tmpObj.id;
        }
        Object.entries(tmpObj).forEach(([key, value]) => {
            if (typeof value === 'undefined') {
                delete tmpObj[key];
                delete localObj[key];
            }
            else if (value instanceof Date) {
                tmpObj[key] = value.toISOString();
                localObj[key] = value.toISOString();
            } else if (value instanceof Object) {
                value = this.cleanObject(value);
                tmpObj[key] = value;
            }
        });
        return tmpObj;
    }

    async processObject(apiObj, entityName, localObj = null, title = null) {
        let apiId = apiObj.id;
        let apiUpdatedAt = moment.utc(apiObj.updatedAt.date).toISOString();
        delete apiObj["id"];
        delete apiObj["createdAt"];
        delete apiObj["updatedAt"];
        delete apiObj["platList"];
        delete apiObj["floorPlanList"];
        delete apiObj["rating"];
        delete apiObj["dbImageList"];

        if (localObj == null) {
            localObj = await this.manager.findOne(entityName, {where: {apiId: apiId}});

            if (localObj == null) {
                localObj = {apiId};
            }

            if (apiObj.deedType != null && apiObj.deedType.id != null) {
                localObj.deedType = await this.manager.findOne('DeedType', {where: {apiId: apiObj.deedType.id}});
                delete apiObj.deedType;
            }

            if (apiObj.title != null && apiObj.title.id != null) {
                localObj.title = await this.manager.findOne('Title', {where: {apiId: apiObj.title.id}});
                delete apiObj.title;
            }

            if (apiObj.masterDocument != null && apiObj.masterDocument.id != null) {
                localObj.masterDocument = await this.manager.findOne(entityName, {where: {apiId: apiObj.masterDocument.id}});
                delete apiObj.masterDocument;
            }
        }

        if (localObj.id == null || apiUpdatedAt == null || localObj.syncedAt == null
            || (localObj.syncedAt != null && moment(apiUpdatedAt).isAfter(moment(localObj.syncedAt)))
            || moment(apiUpdatedAt).isAfter(moment(localObj.updatedAt))) {

            await Object.entries(apiObj).forEach(async ([key, value]) => {
                if (value != null) {
                    if (key.toLowerCase().includes('date'))
                        value = moment(value.date).toISOString();
                    else if (typeof value === 'object' && !Array.isArray(value) && value.hasOwnProperty('id')) {
                        value.apiId = value.id;
                        delete value.id;
                        if (typeof localObj[key] !== 'undefined')
                            value = Object.assign(localObj[key], value);
                        localObj[key] = value;
                    }
                    localObj[key] = value;
                } else
                    localObj[key] = value;
            });

            if (apiUpdatedAt != null)
                localObj.syncedAt = moment(apiUpdatedAt).toISOString();
            if (localObj.hasOwnProperty('title') && localObj.title == null) {
                console.warn("Sync Failed" + apiId, entityName);
                return;
            }

            localObj.apiId = apiId;

            await this.manager.save(entityName, localObj);
        } else {
            console.warn(entityName, apiId, "sync data skiped -> apiDate:" + apiUpdatedAt + " -- syncedAt:" + moment(localObj.syncedAt).toISOString() + " - updatedAt:" + moment(localObj.updatedAt).toISOString());
        }
    }

    async processDeedType(apiObj) {
        'strict';
        let localObj = await this.connection.getRepository('DeedType').createQueryBuilder('deedType')
            .where("deedType.apiId = :apiId", {apiId: apiObj.id})
            .getOne();

        if (localObj == null) {
            localObj = await this.connection.getRepository('DeedType').createQueryBuilder('deedType')
                .where("deedType.code = :code", {code: apiObj.code})
                .andWhere("deedType.docType = :docType", {docType: apiObj.docType})
                .andWhere("deedType.scope = :scope", {scope: apiObj.scope})
                .getOne();
        }

        if (localObj == null) {
            console.warn("Deed Type Created " + apiObj.id, apiObj.name);
            apiObj.apiId = apiObj.id;
            delete apiObj.id;
            localObj = await this.manager.save('DeedType', apiObj);
        } else {
            if (apiObj.updatedAt != null) {
                apiObj.updatedAt = moment.utc(apiObj.updatedAt.date).toISOString();
                if (localObj.syncedAt != null && moment(localObj.syncedAt).isSameOrAfter(moment(apiObj.updatedAt))) return;
                if (localObj.syncedAt != null && moment(localObj.updatedAt).isAfter(moment(apiObj.updatedAt))) return;
            }

            localObj = Object.assign(localObj, {
                apiId: apiObj.id,
                code: apiObj.code,
                name: apiObj.name,
                scope: apiObj.scope,
                docType: apiObj.docType,
                syncedAt: apiObj.updatedAt
            });

            console.warn("Deed Type Synced " + localObj.apiId, localObj.name);
            await this.manager.save('DeedType', localObj);
        }
        return localObj;
    }

    //***************************************************
    //*******************  QUEUE  ***********************
    //***************************************************
    async addSyncQueue(objId, uri, type, entityName) {
        "strict";
        if (!this.connection.isConnected)
            await this.connection.connect();
        let syncQueue;
        if (objId != null)
            syncQueue = await this.manager.findOne(SyncQueue, {where: {objId, entity: entityName}});
        else {
            objId = 0;
            syncQueue = await this.manager.findOne(SyncQueue, {where: {objId, uri: uri, entity: entityName}});
        }

        if (typeof syncQueue === 'undefined') {
            syncQueue = new SyncQueue();
        }
        syncQueue = Object.assign(syncQueue, {objId, uri, type, entity: entityName});
        await this.manager.save(SyncQueue, syncQueue);
        return syncQueue;
    }

    async removeSyncQueue(syncObj) {
        if (!this.connection.isConnected)
            await this.connection.connect();
        await this.manager.remove(SyncQueue, syncObj);
    }

    async executeSyncQueue(props) {
        "strict";
        if (SYNCHRONIZE_FLAG == 'true') {
            let isConnected = false;
            await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

            if (isConnected) {
                if (!this.connection.isConnected)
                    await this.connection.connect();

                const syncQueue = await this.manager.find(SyncQueue);
                console.warn("Pending Sync", syncQueue.length);
                if (syncQueue.length > 0) {
                    console.warn("Executing queue...");
                    for (const syncItem of syncQueue) {
                        let type = syncItem.type.split('.relation.')[0];
                        let relations = syncItem.type.split('.relation.')[1];
                        let params = {where: {id: syncItem.objId}};
                        if (relations != null) {
                            params = {where: {id: syncItem.objId}, relations: relations.split(',')};
                        }
                        let localObj = await this.manager.findOne(syncItem.entity, params);

                        console.warn(syncItem.entity, "relations: " + relations);

                        if (localObj == null && syncItem.type != 'getAll') {
                            console.warn("remove from queue " + syncItem.objId + "-" + syncItem.entity);
                            await this.removeSyncQueue(syncItem);
                            continue;
                        }

                        let uriParts = syncItem.uri.split('$');
                        if (uriParts.length > 1) {
                            let rootRelation = uriParts[1];
                            let relationObj = localObj[rootRelation];
                            if (relationObj != null && relationObj.apiId != null) {
                                syncItem.uri = syncItem.uri.replace('$' + rootRelation + '$', relationObj.apiId);
                            } else {
                                console.warn("The root relationship '" + rootRelation + "' must be in sync for", syncItem.entity + " " + syncItem.objId);
                                continue;
                            }

                        }


                        if (type == "imageList") {
                            // console.log("get all images");
                            // console.log(syncItem.uri);
                            // this.syncGetAll(syncItem.uri, syncItem.entity, null, {});
                            // let localObj = await this.manager.findOne(syncItem.entity, {
                            //     where: {id: syncItem.objId},
                            //     relations: ['dbImageList']
                            // });
                            // await this.getImages(localObj, syncItem.uri, syncItem.entity);
                            await this.removeSyncQueue(syncItem);
                        }

                        if (type == "getAll") {
                            await this.removeSyncQueue(syncItem);
                            await this.syncGetAll(syncItem.uri, syncItem.entity, null, {});
                        }

                        if (type == "remove") {
                            await this.removeSyncQueue(syncItem);
                            this.removeObject(syncItem.uri, syncItem.entity);
                        }

                        if (type == "store") {
                            await this.removeSyncQueue(syncItem);
                            await this.syncObject(localObj, syncItem.uri, syncItem.entity, props);
                        }

                        if (type == "upload") {
                            // await this.uploadImages(localObj);
                            await this.removeSyncQueue(syncItem);
                        }
                    }

                    console.warn("Queue finished!");
                } else {
                    console.log("Nothing to sync");
                }
            }
        }
    }

    //***************************************************
    //*******************  IMAGES  **********************
    //***************************************************
    async uploadImages(image) {
        if (SYNCHRONIZE_FLAG == 'true') {
            let imageUri = (this.platformOS === 'android') ? image.imageData.uri : image.imageData.uri.replace('file://', '');
            let data = {
                uri: imageUri,
                name: image.name,
                filename: image.name,
                type: image.imageData.mimeType
            };
            if (typeof this.token === 'undefined')
                await this.getToken();

            let body = new FormData();
            body.append('image', data);

            return await fetch(ENDPOINT + '/api/images',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json',
                        'Authorization': 'Bearer ' + this.token
                    },
                    body: body
                })
                .then((response) => {
                    if (response.status === 200)
                        return response.json();
                    return response.json().then(json => Promise.reject({
                        status: response.status,
                        message: json,
                    }));
                })
                .then(async (json) => {
                    for (let apiImage of json.results) {
                        await this.processDbImage(apiImage, image);
                    }
                    return json;
                })
            // .catch((e) => console.warn(e))
            // .done()

        }
    }

    async getImages(localObj, uri, entityName) {
        return await fetch(ENDPOINT + '/api/' + uri,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                },
            })
            .then((response) => {
                if (response.status === 200)
                    return response.json();
                return response.json().then(json => Promise.reject({
                    status: response.status,
                    message: json,
                }));
            })
            .then(async (json) => {
                if (localObj.dbImageList == null || localObj.dbImageList.length == 0) {
                    localObj.dbImageList = json.results;
                } else {
                    localObj.dbImageList = [];
                }

                for (let apiImage of json.results) {
                    let localDbImage = await  this.manager.findOne('DbImage', {where: {apiId: apiImage.id}});
                    if (localDbImage == null) {
                        localDbImage = apiImage;
                        localDbImage.apiId = apiImage.id;
                        delete localDbImage.id;
                        await this.manager.save('DbImage', localDbImage);
                    } else {
                        let apiUpdatedAt = moment(apiImage.updatedAt);
                        if (apiUpdatedAt.isAfter(moment(localDbImage.updatedAt))) {
                            localDbImage.imageData = Object.assign(localDbImage.imageData, apiImage.imageData);
                            localDbImage = await this.manager.save('DbImage', localDbImage);
                        }
                    }
                    localObj.dbImageList.push(localDbImage);
                }

                await this.manager.save(entityName, localObj);

                return json;
            })

    }

    async processDbImage(apiDbImage, localDbImage) {
        localDbImage.apiId = localDbImage.id;
        localDbImage.syncedAt = moment(apiDbImage.updatedAt.date).toISOString();
        localDbImage.imageData = Object.assign(localDbImage.imageData, apiDbImage.imageData);
        await this.manager.save('DbImage', localDbImage);
    }

};