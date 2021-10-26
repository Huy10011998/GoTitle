import {SYNCHRONIZE_FLAG} from 'react-native-dotenv';
import {
    TitleRepository,
    DeedTypeRepository,
    TitleDetailRepository,
    TitleSellerRepository,
    DbImageRepository,
    CustomerRepository
} from 'src/repositories/index';

import {TitleTest} from 'src/tests/TitleTest';
import AntIcon from "react-native-vector-icons/AntDesign";
import React, {Component} from 'react';
import {View, SafeAreaView, StyleSheet, ImageBackground, TouchableOpacity} from 'react-native';
import {Button, Appbar} from 'react-native-paper';
import photoStarScreen from '../../images/bg.jpg'

import {getConnection, getManager, getCustomRepository} from "typeorm";
import SyncService from 'src/services/SyncService';
import {Title, User} from "src/entities/index";
import AsyncStorage from "@react-native-community/async-storage";
import {AuthService} from 'src/services/index';

import {Palette} from 'src/Style/app.theme';

class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground 
            source={photoStarScreen}
            style={stylesStart.imageStartScreen}
            imageStyle={stylesStart.imageStartScreen2}
            >
                {this.props.children}
            </ImageBackground>
        )
    }
}

export default class StartScreen extends React.Component {

    constructor(props) {
        super(props);
        this.connection = getConnection();
        this.manager = getManager();
        this.syncService = new SyncService();
        this.titleRepository = getCustomRepository(TitleRepository);
        this.titleDetailRepository = getCustomRepository(TitleDetailRepository);
        this.titleSellerRepository = getCustomRepository(TitleSellerRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);
        this.customerRepository = getCustomRepository(CustomerRepository);
    }

    componentDidMount() {
        this.loadDeedTypes();
    }

    async test() {
        let title = await this.titleRepository.findOne(3, {relations: ['location', 'titleDetail', 'customer']});
        await this.syncService.syncItem(this.titleRepository, title);
    }

    async removeTitle() {
        let titleTest = new TitleTest();
        titleTest.removeTest();
    }

    async loadDeedTypes() {
        if (!this.connection.isConnected) {
            await this.connection.connect();
        }
        if (SYNCHRONIZE_FLAG == 'true') {
            console.log('syncing DeedTypes');
            const deedTypeRepository = getCustomRepository(DeedTypeRepository);
            let deedTypeList = await deedTypeRepository.find();
            deedTypeList = await this.syncService.syncList(deedTypeRepository, deedTypeList);
            console.log(deedTypeList.length);
            this.userSave();
        }
    }

    async userSave() {
        let newUserSave;
        AsyncStorage.getItem('user-token').then(
            (token) => {
                AuthService.getUser(token).then(async (response) => {
                    let user = response.results;

                    user.forEach(async (newUser) => {
                        newUserSave = {
                            apiId: newUser.id,
                            name: newUser.name,
                            lastName: newUser.lastName,                  
                            email: newUser.email
                        };

                        const dbUser = await this.manager.findOne(User, {where: {apiId: newUserSave.apiId}});
                        if (dbUser !== null) {
                            if (dbUser.apiId === newUser.id) {
                                newUserSave = {
                                    id: dbUser.id,
                                    apiId: newUserSave.apiId,
                                    name: newUserSave.name,
                                    lastName: newUserSave.lastName,
                                    email: newUserSave.email
                                }
                            }
                        } else {
                            newUserSave = {
                                apiId: newUserSave.id,
                                name: newUserSave.name,
                                lastName: newUserSave.lastName,
                                email: newUserSave.email
                            };
                        }
                        this.manager.save(User, newUserSave);

                        this.saveUserId(newUserSave.apiId);
                        let tmpTitle = await this.manager.find(Title, {relations: ['owner']});

                        tmpTitle.forEach(async (tmpTitle) => {
                            if (tmpTitle.owner === null) {
                                tmpTitle.owner = newUserSave;
                                await this.manager.save(Title, tmpTitle);
                            }
                        });
                    });
                }, error => {
                    if (error.status === 401 || error.status === 403) {
                        AsyncStorage.removeItem('user-token').then(async () => {
                            if (getConnection().isConnected)
                                await getConnection().close();
                            this.props.navigation.navigate("AuthNav");
                        });
                    }
                    console.warn('Login error', error);
                });
            });
    }

    saveUserId(id) {
        AsyncStorage.setItem('user-id', id.toString())
            .then(() => {
            }, err => console.error("error", err));
        }

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: (
                <Button
                        uppercase={false}
                        color={'#eee'}
                        onPress={() => {
                            navigation.openDrawer();
                        }}
                    >
                        <AntIcon name="bars" size={30} color={Palette.light}/>
                    </Button>
            )
        }
    };


    render() {
        return (

            // <SafeAreaView style={{flex: 1}}>
            <View>
                 {/* <Appbar style={stylesStart.navbarColor}>

                        <Appbar.Action
                            icon="menu"
                            color="#fff"
                            onPress={() => {
                                this.props.navigation.toggleDrawer();
                            }}

                        />
                        <Appbar.Content
                            color="#fff"
                            title="GoTitle"
                        />

                </Appbar> */}

                <View>
                    <BackgroundImage >
                        <View style={stylesStart.viewContainer}>
                            <TouchableOpacity  onPress={() => this.props.navigation.navigate('NewTitle')}>
                                <Button
                                    style={stylesStart.button}
                                    icon="plus-circle-outline"
                                    labelStyle={{fontWeight: 'bold'}}
                                    mode="contained"
                                    textStyle="borderColor"
                                    uppercase={false}
                                    color={Palette.light}>
                                    Start a New Title
                                </Button>
                            </TouchableOpacity>
                            
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('continueTitle')}>
                                <Button
                                    style={stylesStart.button}
                                    icon="pencil"
                                    uppercase={false}
                                    labelStyle={{fontWeight: 'bold'}}
                                    mode="contained"
                                    textStyle="borderColor"
                                    color={Palette.light}>
                                    Continue a Title
                                </Button>
                            </TouchableOpacity>
                        </View>
                    </BackgroundImage>
                </View>
            </View>
               
            // </SafeAreaView>
        );
    }
}

const stylesStart = StyleSheet.create({

    button: {
        marginLeft: 60,
        marginRight: 60,
        borderRadius: 12,
        borderColor: Palette.primary,
        borderWidth: 1,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        },
    viewContainer: {
        alignContent: 'center',
        justifyContent: 'space-around',
        marginTop: '30%',
        width: '100%',
        height: '50%',
    },
    navbarColor: {
        // backgroundColor: '#006eaf',
        marginTop: 50
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    }
});