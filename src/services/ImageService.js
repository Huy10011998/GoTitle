import {ENDPOINT} from 'react-native-dotenv';
import NetInfo from "@react-native-community/netinfo";
import {Platform} from 'react-native';

import {getManager, getConnection} from "typeorm";
import {SyncQueue} from "src/entities/index";

import AsyncStorage from "@react-native-community/async-storage";
import moment from "moment";

export const TYPE_STORE = 'store';
export default class ImageService {
    constructor() {
        this.connection = getConnection();
        this.manager = getManager();
        this.token = undefined;
        this.getToken();
        this.platformOS = Platform.OS;
    }

    async getToken() {
        await AsyncStorage.getItem('user-token').then((userToken) => {
            this.token = userToken;
        });
        return this.token;
    }

    async syncObject1(localObj, uri, entityName) {
        let method = 'POST';
        if (localObj.apiId !== null && typeof localObj.apiId !== 'undefined') {
            method = 'PUT';
            uri += '/' + localObj.apiId;
        }
        console.log('syncObject', uri);
        return undefined;
    }

    async syncObject(localObj, uri, entityName) {

        let isConnected = false;
        await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

        let method = 'POST';
        if (localObj.apiId !== null && typeof localObj.apiId !== 'undefined') {
            method = 'PUT';
            uri += '/' + localObj.apiId;
        }
        this.cleanObject(localObj);
        console.log("url " + method, ENDPOINT + '/api/' + uri);
        console.log(entityName);
        console.log("Local Obj", localObj.syncedAt);

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
                    body: JSON.stringify(localObj)
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
                    json.results.forEach(async apiObj => {
                        this.processObject(apiObj, entityName, localObj);
                    });
                    return json;
                })
        } else {
            return this.addSyncQueue(localObj.id, uri, 'store', entityName);
        }
    }

    async syncGetObject(obj, uri, entityName) {

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
                        message: json.error_description,
                        class: entityName
                    }));
                })
                .then((json) => {
                    // console.log(json);
                    return json;
                })
        } else {
            return this.addSyncQueue(obj.id, uri, 'store', entityName);
        }
    }

    async removeObject(uri, entityName) {
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
                        message: json.error_description
                    }));
                })
                .then((json) => {
                    return json;
                });
        } else {
            return await this.addSyncQueue(obj.id, uri, 'delete', entityName);
        }
    }


    async syncGetAll(uri, entityName, title = null) {
        let isConnected = false;
        await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

        if (isConnected) {
            if (typeof this.token === 'undefined')
                await this.getToken();

            if (!this.connection.isConnected)
                await this.connection.connect();

            return await fetch(ENDPOINT + '/api/' + uri,
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
                        message: json.error_description,
                        class: entityName
                    }));
                })
                .then((json) => {
                    json.results.forEach(async apiObj => {
                        this.processObject(apiObj, entityName, null, title);
                    });
                    return json;
                });
        }
    }


    async clearSyncQueue() {
        if (!this.connection.isConnected)
            await this.connection.connect();
        await this.manager.clear(SyncQueue);
        console.warn("Sync Queue cleared!");
    }

    cleanObject(obj) {
        'strict';
        Object.entries(obj).forEach(([key, value]) => {
            if (typeof value === 'undefined')
                delete obj[key];
            else if (value instanceof Date) {
                obj[key] = value.toISOString();
            } else if (value instanceof Object) {
                this.cleanObject(value);
            }
        });
    }

    async processObject(apiObj, entityName, localObj = null, title = null) {
        let apiId = apiObj.id;
        delete apiObj["id"];
        delete apiObj["createdAt"];
        // delete apiObj["updatedAt"];
        delete apiObj["platList"];
        delete apiObj["floorPlanList"];
        delete apiObj["rating"];
        delete apiObj["owner"];

        if (!localObj)
            localObj = await this.manager.findOne(entityName, {apiId: apiId});

        if (localObj) {
            // console.log("update " + entityName);
            localObj.apiId = apiId;
            console.log("apiObj",apiObj.updatedAt);
            Object.entries(apiObj).forEach(async ([key, value]) => {
                if (value !== null) {
                    if (key.toLowerCase().includes('date'))
                        value = moment(value.date).toISOString();
                    else if (typeof value === 'object' && !Array.isArray(value) && value.hasOwnProperty('id')) {
                        if (key === 'deedType') {
                            this.processDeedType(value);
                        } else {
                            value.apiId = value.id;
                            delete value.id;
                            if (typeof localObj[key] !== 'undefined')
                                value = Object.assign(localObj[key], value);
                            localObj[key] = value;
                        }
                    }
                    localObj[key] = value;
                } else
                    localObj[key] = value;
            });
            if (title)
                localObj.title = title;
            await this.manager.save(entityName, localObj).catch(e => console.log(e));
            // console.log("updated!");
        } else {
            localObj = {apiId};
            // console.log("new " + entityName);
            Object.entries(apiObj).forEach(async ([key, value]) => {
                if (value !== null) {
                    if (key.toLowerCase().includes('date'))
                        value = moment(value.date).toISOString();
                    else if (typeof value === 'object' && !Array.isArray(value) && value.hasOwnProperty('id')) {
                        if (key === 'deedType') {
                            this.processDeedType(value);
                        } else {
                            value.apiId = value.id;
                            delete value.id;
                            if (typeof localObj[key] !== 'undefined')
                                value = Object.assign(localObj[key], value);
                            localObj[key] = value;
                        }
                    }
                    localObj[key] = value;
                } else
                    localObj[key] = value;
            });
            if (title)
                localObj.title = title;
            localObj.syncedAt = new Date();
            await this.manager.save(entityName, localObj);
            // console.log("saved!");
        }
    }

    async processDeedType(obj) {
        'strict';
        let localObj = await this.connection.getRepository('DeedType').createQueryBuilder('deedType')
            .where("deedType.code = :code", {code: obj.code})
            .andWhere("deedType.docType = :docType", {docType: obj.docType})
            .getOne();
        if (!localObj) {
            obj.apiId = obj.id;
            delete obj.id;
            await this.manager.save('DeedType', obj);
        }
        return obj;
    }

    async uploadImages(image, uri) {
        let imageUri = (this.platformOS === 'android') ? image.uri : image.uri.replace('file://', '');
        let data = {
            uri: imageUri,
            name: image.name,
            filename: image.name,
            type: image.type
        };
        if (typeof this.token === 'undefined')
            await this.getToken();

        let body = new FormData();
        body.append('file', data);

        return fetch(ENDPOINT + '/api/' + uri,
            {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': 'Bearer ' + this.token
                },
                body: body
            })
            .then((response) => {
                'strict';
                if (response.status === 200)
                    return response.json();
                // return response.json().then(json => Promise.resolve({image:json}));
                return response.json().then(json => Promise.reject({
                    status: response.status,
                    message: json.error_description,
                }));
            })
            .then((res) => {
                return res.results[0];
            })
        // .catch((e) => console.warn(e))
        // .done()
    }


    //***************************************************
    //*******************  QUEUE  ***********************
    //***************************************************
    async addSyncQueue(objId, uri, type, entityName) {
        if (!this.connection.isConnected)
            await this.connection.connect();

        let syncQueue = await this.manager.findOne(SyncQueue, {where: {objId, entity: entityName}});
        if (typeof syncQueue === 'undefined') {
            syncQueue = new SyncQueue();
            syncQueue = Object.assign(syncQueue, {objId, uri, type, entity: entityName});
            await this.manager.save(SyncQueue, syncQueue);
        }
        return syncQueue;
    }

    async removeSyncQueue(objId, entity) {
        if (!this.connection.isConnected)
            await this.connection.connect();
        let syncQueue = await this.manager.remove(SyncQueue, {where: {objId, entity}});
    }

    async executeSyncQueue() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        const syncQueue = await this.manager.find(SyncQueue);
        console.warn("Pending Sync", syncQueue.length);
        if (syncQueue.length > 0) {
            console.warn("Executing queue...");
            for (const syncItem of syncQueue) {
                let type = syncItem.type.split('.relation.')[0];
                let relation = syncItem.type.split('.relation.')[1];
                let obj = undefined;
                console.warn(syncItem.entity, "relation: " + relation);
                if (typeof relation === 'undefined') {
                    obj = await this.manager.findOne(syncItem.entity, {where: {id: syncItem.objId}});
                } else {
                    obj = await this.manager.findOne(syncItem.entity, {
                        where: {id: syncItem.objId},
                        relations: [relation]
                    });
                    if (typeof obj === 'undefined') {
                        console.warn("remove from queue " + syncItem.objId + "-" + syncItem.entity);
                        await this.removeSyncQueue(syncItem.objectId, syncItem.entity);
                        continue;
                    }
                    if (relation !== 'location' && relation !== 'deedType') {
                        let relationObj = obj[relation];
                        if (relationObj && relationObj.apiId) {
                            syncItem.uri = syncItem.uri.replace('$rootId', relationObj.apiId);
                        } else continue;
                    }

                    console.log("before switch", syncItem);

                }
                switch (type) {
                    case "getall":
                        console.log("get all");
                        break;
                    case "get":
                        console.log("get one");
                        break;
                    case "delete":
                        console.log("delete one");
                        // this.removeObject(syncItem.uri, syncItem.entity);
                        break;
                    case "store":
                        console.log("store one");
                        await this.syncObject(obj, syncItem.uri, syncItem.entity);
                        break;
                    default:
                        console.log("default");
                }
                // console.log('Obj', obj);
                console.log('SyncObj', syncItem);
                // this.removeSyncQueue(syncItem.objectId,syncItem.entity);
            }
        } else {
            console.log("Nothing to sync");
        }
    }
};