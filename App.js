import React, {Component} from 'react';

import {createAppContainer} from "src/services/Router";
import SyncService from "src/services/SyncService";

import AsyncStorage from "@react-native-community/async-storage";
import {createConnection, getConnection, getConnectionManager, getManager} from "typeorm";
import ormConfig from 'src/database/config';
import "reflect-metadata";

import {OauthToken, SyncQueue} from 'src/entities/index';
import {AuthService} from 'src/services/index';
import {REFRESH_TIME_TOKEN} from "react-native-dotenv";
import NetInfo from "@react-native-community/netinfo";

export default class App extends Component {

    constructor(props) {
        super(props);
        this.state = {
            signedIn: false,
            checkedSignIn: false,
            dbConnected: false
        };
        this.eventSync;
        this.createDbConnection();
        this.syncService = new SyncService();
    }

    createNetEvent() {
        this.eventSync = NetInfo.addEventListener(state => {
            if (state.isConnected && this.state.dbConnected && this.state.signedIn) {
                console.log("DB Connection OK");
                // this.syncService.executeSyncQueue();
                console.log("DB Sincronizando..");
            } else {
                console.warn("Connection lost");
            }
        });
        // AsyncStorage.getItem('timerId').then((timerId) => {
        //     if (timerId) {
        //         console.log("found timerID", timerId);
        //     } else {
        //         // timerId = this.initInterval();
        //         timerId = 999;
        //         // AsyncStorage.setItem("timerId",String(999)).then(()=>{
        //         //     console.log("timerId saved", timerId);
        //         // });
        //     }
        // });
    }

    initInterval(interval = 60000) {
        let count = 0;
        return setInterval(async () => {
            let queue = await getManager().find(SyncQueue);
            if (queue && queue.length > 0) {
                console.log("Queue Length", queue.length);
            }
            count++;
            console.log("Timer " + this.timerId, count);
            if (interval != 60000) {
                clearInterval(this.timerId);
                this.initInterval();
            } else if (count > 1000) {
                clearInterval(this.timerId);
            }

        }, interval);
    }

    async createDbConnection() {
        if (!getConnectionManager().has("default")) {
            await createConnection(ormConfig).then(() => {
            }, (error) => {
                alert(error);
            });

            /**
             * Undo last migration and run it again.
             */
            // const migrations = connection.getMigrations();
            // await connection.undoLastMigration();
            // await connection.runMigrations();
            // await connection.close();
        }
        NetInfo.addEventListener(state => {
            AsyncStorage.getItem('user-token').then(
                async (token) => {
                    if (token !== null) {
                        if (state.isConnected) {

                            let connection = await getConnection();
                            if (!connection.isConnected)
                                await connection.connect();

                            this.manager = getManager();

                            let oauthTokens = await connection
                                .getRepository(OauthToken)
                                .createQueryBuilder('ot')
                                .where('ot.access_token = :token', {token: token})
                                .getOne();
                            let date = new Date();
                            if (oauthTokens) {
                                let timeCount = Math.ceil(Math.abs(oauthTokens.expired_at - date.getTime())/ (1000 * 60));

                                if (timeCount <= REFRESH_TIME_TOKEN) {
                                    AuthService.refreshToken(oauthTokens.refresh_token).then(async (newToken) => {

                                        let date = new Date();
                                        newToken.expired_at = new Date(date.getTime() + Number(newToken.expires_in) * 1000);
                                        await this.manager.save(OauthToken, newToken);
                                        await AsyncStorage.setItem('user-token', newToken.access_token)
                                            .then(() => {
                                                this.setState({signedIn: true, checkedSignIn: true, dbConnected: true});
                                            }, err => console.error(err));
                                    }, error => {
                                        if(error.status === 401 || error.status === 403){
                                            AsyncStorage.removeItem('user-token').then(async () => {
                                                this.setState({signedIn: false, checkedSignIn: true, dbConnected: true});
                                            });
                                            console.warn("refresh_token", error);
                                        } else {
                                            this.setState({signedIn: true, checkedSignIn: true, dbConnected: true});
                                        }
                                    });
                                } else {
                                    this.setState({signedIn: true, checkedSignIn: true, dbConnected: true});
                                    this.createNetEvent();
                                }
                            } else {
                                this.setState({signedIn: true, checkedSignIn: true, dbConnected: true});
                                if (typeof this.eventSync === 'undefined')
                                    this.createNetEvent();
                            }
                        } else {
                            this.setState({signedIn: true, checkedSignIn: true, dbConnected: true});
                            if (typeof this.eventSync === 'undefined')
                                this.createNetEvent();
                        }
                    } else {
                        this.setState({signedIn: false, checkedSignIn: true, dbConnected: true});
                        if (typeof this.eventSync !== 'undefined') {
                            this.eventSync();
                            clearInterval(this.timerId);
                        }
                    }
                }).catch(err => alert(err));
        });
    }

    render() {
        const {checkedSignIn, signedIn, dbConnected} = this.state;
        if (!dbConnected) {
            return null;
        }

        if (!checkedSignIn) {
            return null;
        }
        const AppContainer = createAppContainer(signedIn);
        return <AppContainer/>;
    }
}