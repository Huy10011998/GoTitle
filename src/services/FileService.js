import {ENDPOINT} from 'react-native-dotenv';
import NetInfo from "@react-native-community/netinfo";
import {Platform} from 'react-native';
import {dirHome, generatePathHome} from 'src/utils/FileStorage';
import RNFS from "react-native-fs";
import {getManager, getConnection} from "typeorm";
import {SyncQueue} from "src/entities/index";

import AsyncStorage from "@react-native-community/async-storage";

export default class FileService {

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

    downloadReportFile(title, fileName, uri) {
        let directory = generatePathHome(title) + 'report';
        RNFS.exists(directory).then(isExist => {
            if (!isExist) {
                RNFS.mkdir(directory).then(() => {
                    this.downloadFile(directory, fileName, uri)
                });
            } else {
                this.downloadFile(directory, fileName, uri);
            }
        });
        RNFS.writeFile(directory + '/' + fileName, '', 'utf8').then(() => {
            return RNFS.downloadFile({
                fromUrl: ENDPOINT + '/api/' + uri,
                toFile: directory + '/' + fileName,
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
            }).promise.then(() => {
                console.log("File Downloaded");
            }).catch(e => console.log(e));
        }).catch(e => console.log(e));
    }

    downloadFile(directory, fileName, uri) {

        RNFS.writeFile(directory + '/' + fileName, '', 'utf8').then(() => {
            return RNFS.downloadFile({
                fromUrl: ENDPOINT + '/api/' + uri,
                toFile: directory + '/' + fileName,
                headers: {
                    'Authorization': 'Bearer ' + this.token
                },
            }).promise.then((data) => {
                console.log(directory + '/' + fileName);
                console.log("File Downloaded");
            }).catch(e => console.log(e));
        }).catch(e => console.log(e));
    }


};