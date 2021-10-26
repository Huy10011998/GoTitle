import React, {Component, Fragment} from "react";
import {NavigationEvents} from "react-navigation";
import {FlatList, SafeAreaView, StyleSheet, Text, View, ImageBackground, Button} from "react-native";
import {IconButton, Searchbar, ActivityIndicator} from "react-native-paper";

import {Palette} from "src/Style/app.theme";

import {getConnection, getManager, getCustomRepository} from "typeorm";
import {TitleRepository} from 'src/repositories/index';
import {Title, User, TitleDetail as TitleDetailEntity} from "src/entities/index";
import SyncService from 'src/services/SyncService';
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";

import photoStarScreen from '../../images/bg.jpg'
import { ScrollView } from "react-native-gesture-handler";

import FeatherIcon from "react-native-vector-icons/Feather"
import { TouchableOpacity } from "react-native-gesture-handler";
class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground 
            source={photoStarScreen}
            style={styles.imageStartScreen}
            imageStyle={styles.imageStartScreen2}
            >
                {this.props.children}
            </ImageBackground>
        )
    }
}

const moment = require('moment');

export default class continueTitle extends React.Component {
    constructor(props) {
        super(props);

        this.titleRepository = getCustomRepository(TitleRepository);
        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();

        this.state = {
            open: false,
            isShowSearchBar: false,
            list: [],
            tmpList: [],
            searchText: '',
            syncFlag: 0,
            refreshing: true
        };

        this.showSearchBar = this.showSearchBar.bind(this);
        this.props.navigation.setParams({showSearchBar: this.showSearchBar});
    };

    static navigationOptions = ({navigation, navigation :{goBack}}) => {
        return {
            headerLeft: (
                (Platform.OS == "ios") ?

                <TouchableOpacity onPress={() => goBack()}>
                                <View style={{flexDirection: 'row'}}>

                                    <View style={styles.iconView}>
                                        <FeatherIcon name="chevron-left" size={33} color={Palette.light} style={{marginLeft: 5}}/>
                                    </View >

                                    {/* <View style={{justifyContent: 'center', fontWeight: '600'}}>
                                         <Text style={{color: '#fff', fontSize: 17}}>
                                                 Back
                                        </Text>
                                    </View> */}
                                                
                                </View>
                                        
                </TouchableOpacity>
                    // <Button
                    //     uppercase={false}
                    //     color={'#fff'}
                    //     onPress={navigation.getParam('showModalSave')}
                    // ><Text style={{fontSize: 17}}>Back</Text></Button> 
                    :
                    <IconButton
                        icon="arrow-left" color="white" size={30}
                        onPress={navigation.getParam('showModalSave')}/>
            ),
            title: 'continueTitle',
            headerStyle: {
                backgroundColor: '#006eaf',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
            headerRight: () =>
                <IconButton
                    icon="magnify" color="white" size={30}
                    onPress={ navigation.getParam('showSearchBar') }
                />
            ,
        }
    };

    async loadTitleList() {
        if (!this.connection.isConnected)
            await  this.connection.connect();
        let userId = await AsyncStorage.getItem('user-id');
        if (userId) {
            let user = await this.manager.findOne(User, {where: {apiId: parseInt(userId)}});
            let titleList = await this.manager.find(Title, {
                where: {owner: {id: user.id}},
                relations: ['location', 'owner', 'customer', 'titleDetail'],
                order: {
                    syncedAt: "DESC"
                }
            });

            let isConnected = false;
            await NetInfo.fetch().then(async (state) => isConnected = state.isConnected);

            this.setState((prevState) => ({
                ...prevState,
                refreshing: isConnected,
                syncFlag: 1,
                list: titleList,
                tmpList: titleList
            }));

            if (isConnected) {
                this.syncService.syncList(this.titleRepository, titleList).then(titleList => {
                    this.setState((prevState) => ({
                        ...prevState,
                        refreshing: false,
                        syncFlag: 0,
                        list: titleList,
                        tmpList: titleList
                    }));
                }).catch(err => {
                    console.warn('ContinueTitle loadTitleList', err);
                    this.setState((prevState) => ({...prevState, refreshing: false, syncFlag: 0}));
                });
            }

        }
    }

    showSearchBar() {
        this.setState((prevState) => {
            return {
                ...prevState,
                isShowSearchBar: !prevState.isShowSearchBar,
                tmpList: prevState.list
            }
        })
    }

    searchTitle = (text) => {
        this.setState({
            searchText: text
        });
        if (text == '') {
            this.setState({tmpList: this.state.list});
        } else {
            const newList = this.state.list.filter(item => {
                if (item.legalAddress) {
                    let itemData = "";

                    if (item.status !== null && typeof item.status !== 'undefined') {
                        itemData += item.status + ' ';
                    }

                    if (item.price !== null && typeof item.price !== 'undefined') {
                        itemData += item.price + ' ';
                    }

                    if (item.dateSearch !== null && typeof item.dateSearch !== 'undefined') {
                        itemData += new Date(item.dateSearch).toDateString() + ' ';
                    }

                    if (item.dateEffective !== null && typeof item.dateEffective !== 'undefined') {
                        itemData += new Date(item.dateEffective).toDateString() + ' ';
                    }
                    itemData += `${item.legalAddress}`;
                    const textData = text.toUpperCase();
                    return itemData.toUpperCase().indexOf(textData) > -1;
                }
            });
            this.setState({tmpList: newList});
        }
    };

    keyExtractor = (item, index) => String(item.id);

    render() {
        const {navigate} = this.props.navigation;
        return (
            <BackgroundImage style={{flex: 1}}>
                <View>
                        
                        <NavigationEvents
                            onDidFocus={payload => this.loadTitleList()}
                        />
                        {
                            (this.state.isShowSearchBar) ?
                                <Searchbar
                                    placeholder="Search your title... "
                                    onChangeText={query => this.searchTitle(query)}
                                    value={ this.state.searchText }
                                    onIconPress={() => {
                                        this.showSearchBar()
                                    }}
                                />
                                : null
                        }
                        <ScrollView contentContainerStyle={{flexGrow: 1, paddingBottom: 25}}>
                            <FlatList
                                    keyExtractor={this.keyExtractor}
                                    data={this.state.tmpList}
                                    // contentContainerStyle={ this.state.refreshing ? styles.listContent : styles.listContentState}
                                    style={styles.containerFlat}
                                    refreshing={this.state.refreshing}
                                    onRefresh={() => {
                                        this.setState({refreshing: true});
                                        this.loadTitleList();
                                    }}
                                    renderItem={
                                        ({item}) => <TouchableOpacity style={[styles.card]}
                                                                    onPress={() => navigate('BuildMyTitle', {
                                                                        title: item,
                                                                        titleDetail: item.titleDetail
                                                                    })}>
                                            <View>
                                                <View style={styles.cardContent}>
                                                    <View style={ styles.cardHeader}>
                                                        <Text style={ styles.name }>{moment(item.dateEffective).format('LL')}</Text>
                                                        <Text style={ styles.price }>{ item.price } $us</Text>
                                                    </View>
                                                    <Text style={ styles.description }>{item.legalAddress}</Text>
                                                    <View style={ styles.cardHeader}>
                                                        <Text
                                                            style={ [styles.status, (item.status === 'published') ? {color: Palette.accent} : null] }>{ item.status }
                                                        </Text>
                                                        <Text
                                                            style={ this.state.syncFlag ? styles.pending : item.apiId ? styles.synced : styles.pending }
                                                        >{this.state.syncFlag ? 'Syncing' : item.apiId ? 'Synced' : 'Pending'}</Text>
                                                        {(this.state.syncFlag) ?
                                                            <ActivityIndicator
                                                                color={Palette.lightGray}
                                                                size={15}
                                                                style={{paddingHorizontal: 5}}
                                                            /> : null
                                                        }
                                                    </View>
                                                </View>
                                            </View>
                                        </TouchableOpacity>
                                    }
                                />
                        </ScrollView>
                            
                </View>
            </BackgroundImage>
        );
    }
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: Palette.info,
    },
    listContent: {
        paddingBottom: 100,
        backgroundColor: Palette.light,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.primary
    },
    listContentState: {
        paddingBottom: 0,
        backgroundColor: Palette.light,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.primary
    },
    card: {
        shadowColor: '#00000021',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.37,
        shadowRadius: 5.49,
        elevation: 6,

        marginVertical: 5,
        marginHorizontal: 10,
        backgroundColor: Palette.light,
        padding: 10,
        borderLeftWidth: 6,
        borderColor: Palette.primary
    },
    cardContent: {
        marginLeft: 10,
        marginTop: 10,
      
    },
    cardHeader: {
        flex: 1,
        flexDirection: "row",
    },
    name: {
        fontSize: 18,
        flex: 1,
        color: Palette.primary
    },
    description: {
        fontSize: 14,
        flex: 1,
        color: Palette.darkGray,
        marginTop: 5
    },
    price: {
        fontSize: 18,
        flex: 1,
        color: Palette.accent,
        textAlign: "right"
    },
    status: {
        fontSize: 13,
        flex: 1,
        color: Palette.secondary,
        marginTop: 5,
        textTransform: 'capitalize',
    },
    pending: {
        fontSize: 13,
        flex: 1,
        color: Palette.darkGray,
        textAlign: "right"
    },
    synced: {
        fontSize: 13,
        flex: 1,
        color: Palette.accent,
        textAlign: "right"
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    },
    containerFlat: {
        paddingTop: 10,
    }
});