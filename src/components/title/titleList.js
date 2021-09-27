import React, {Fragment, Component} from 'react';
import {NavigationEvents} from 'react-navigation';
import {View, FlatList, TouchableOpacity, StyleSheet, Text, SafeAreaView} from 'react-native';
import {Searchbar, FAB} from 'react-native-paper';
import {Palette} from 'src/Style/app.theme';
const moment = require('moment');
import {getManager, getConnection} from 'typeorm';
import {Title} from 'src/entities/Title';

export default class titleList extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            list: [],
            searchText: ''
        };
        this.listHolder = [];
    };

    async loadTitleList() {
        if (!getConnection().isConnected)
            await  getConnection().connect();
        const titleList = await this.manager.find(Title, {relations: ['location']});
        this.setState({list: titleList});
    }

    componentDidMount() {
        this.manager = getManager();
    }

    searchTitle = (text) => {
        this.setState({
            searchText: text
        });

        const newList = this.listHolder.filter(item => {
            if (!item.location) {
                const itemData = `${item.location.name.toUpperCase()} ${item.dateSearch.date} ${item.dateEffective}`;
                const textData = text.toUpperCase();
                return itemData.indexOf(textData) > -1;
            }

        });


        this.setState({list: newList});

    };

    keyExtractor = (item, index) => String(item.id);

    render() {
        const {navigate} = this.props.navigation;
        return (
            <SafeAreaView style={{flex: 1}}>
                <NavigationEvents
                    onDidFocus={payload => this.loadTitleList()}
                />
                <FlatList
                    keyExtractor={this.keyExtractor}
                    data={this.state.list}
                    contentContainerStyle={styles.listContent}
                    style={styles.containerFlat}
                    renderItem={
                        ({item}) => <TouchableOpacity style={[styles.card]}
                                                      onPress={() => navigate('TitleDetail', {title: item})}>
                            <View style={styles.cardContent}>
                                <View style={ styles.cardHeader }>
                                    <Text style={ styles.name }>{moment(item.dateEffective).format('LL')}</Text>
                                    <Text style={ styles.price }>{ item.price } $us</Text>
                                </View>
                                <Text style={ styles.description }>{item.location ? item.location.name : ''}</Text>
                                <Text style={ styles.status }>{ item.status }</Text>
                            </View>
                        </TouchableOpacity>
                    }
                    ListHeaderComponent={
                        <Searchbar
                            placeholder="Search your title... "
                            onChangeText={query => this.searchTitle(query)}
                            value={ this.state.searchText }
                            icon="menu"
                            onIconPress={() => {
                                this.props.navigation.toggleDrawer();
                            }}
                        />
                    }
                    stickyHeaderIndices={[0]}
                />
                <FAB
                    style={styles.fab}
                    icon={'add'}
                    onPress={() => navigate('NewTitle')}
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
        marginTop: 5
    },
});