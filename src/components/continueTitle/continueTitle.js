import React, {Component, Fragment} from "react";
import {NavigationEvents} from "react-navigation";
import {FlatList, SafeAreaView, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {IconButton, Searchbar, ActivityIndicator} from "react-native-paper";

import {Palette} from "src/Style/app.theme";

import {getConnection, getManager, getCustomRepository} from "typeorm";
import {TitleRepository} from 'src/repositories/index';
import {Title, User, TitleDetail as TitleDetailEntity} from "src/entities/index";
import SyncService from 'src/services/SyncService';
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";

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
            isShowSearchBar: true,
            list: [],
            tmpList: [],
            searchText: '',
            syncFlag: 0,
            refreshing: true
        };

        this.showSearchBar = this.showSearchBar.bind(this);
        this.props.navigation.setParams({showSearchBar: this.showSearchBar});
    };

    static navigationOptions = ({navigation}) => {
        return {
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
            <SafeAreaView style={{flex: 1}}>
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
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.tmpList}
                    contentContainerStyle={styles.listContent}
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
                            <View style={styles.cardContent}>
                                <View style={ styles.cardHeader}>
                                    <Text style={ styles.name }>{moment(item.dateEffective).format('LL')}</Text>
                                    <Text style={ styles.price }>{ item.price } $us</Text>
                                </View>
                                <Text style={ styles.description }>{item.legalAddress}</Text>
                                <View style={ styles.cardHeader}>
                                    <Text
                                        style={ [styles.status, (item.status === 'published') ? {color: Palette.accent} : null] }>{ item.status }</Text>
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
                        </TouchableOpacity>
                    }

                />
            </SafeAreaView>
        );
    }
};

const styles = StyleSheet.create({
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: Palette.info
    },
    listContent: {
        paddingBottom: 100,
        backgroundColor: Palette.gray
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
});