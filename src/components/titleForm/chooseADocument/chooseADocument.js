import React, {Component, Fragment} from "react";
import {View, FlatList, Text, StyleSheet, TouchableOpacity, SafeAreaView} from "react-native";
import {Button} from 'react-native-paper';
import {Palette} from 'src/Style/app.theme';
import Icon  from 'react-native-vector-icons/MaterialIcons';
import DeedTypeListModal from 'src/components/deedType/deedTypeListModal';

const DATA = [
    {
        key: 'Chain of Title',
        navigateKey: 'DeedForm',
        docType: 'deed',

    },
    {
        key: 'Mortgages',
        navigateKey: 'Mortgage',
        docType: 'mortgage',
    },
    {
        key: 'Liens',
        navigateKey: 'LienForm',
        docType: 'lien',
    },
    {
        key: 'Plat / Floor Plans',
        navigateKey: 'PlatFloorForm',
        docType: 'plat_floor_plan',
    },
    {
        key: 'Easements / Leases',
        navigateKey: 'EasementForm',
        docType: 'easement',
    },
    {
        key: 'Misc | Tax | Civil | Probate',
        navigateKey: 'MiscCivilProbateForm',
        docType: 'misc_civil_probate',
    },
];

export default class ChooseADocument extends Component {
    constructor(props) {
        super(props);
        let title = props.navigation.getParam('title', {});
        this.state = {
            edit: true,
            modal: false,
            docType: '',
            title: title,
        }
    }

    static navigationOptions = {
        title: 'Choose a Document',
        headerStyle: {
            backgroundColor: '#006eaf',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                <View style={stylesChooseADocument.containerView}>

                    <FlatList
                        data={DATA}
                        renderItem={({item}) =>
                            <View style={stylesChooseADocument.Button}>
                                <Icon.Button
                                    backgroundColor="#ffff"
                                    color="#006eaf"
                                    name="info"
                                    size={30}
                                    onPress={() => {
                                        this.setState({docType: item.docType});
                                        if (item.docType.length > 0)
                                            this.setState({modal: true, navigateKey: item.navigateKey});
                                    }}
                                >
                                    <Text style={stylesChooseADocument.TextButton}> {item.key}</Text>
                                </Icon.Button>
                            </View>
                        }
                    />
                    {(this.state.modal) ?
                        <DeedTypeListModal
                            visible={this.state.modal}
                            docType={this.state.docType}
                            onDismiss={() => {
                                this.setState((prevState) => {
                                    return {
                                        ...prevState,
                                        modal: false
                                    }
                                });
                            }}
                            onSelected={(deedType) => {
                                this.setState((prevState) => {
                                    return {
                                        ...prevState,
                                        modal: false
                                    }
                                });
                                let {navigateKey} = this.state;
                                if (deedType.docType === 'tax')
                                    navigateKey = 'TaxForm';
                                this.props.navigation.replace(navigateKey, {
                                    title: this.state.title,
                                    deedType: deedType
                                });
                            }}
                        /> : <View></View>
                    }
                </View>
            </SafeAreaView>
        );
    }
}
const stylesChooseADocument = StyleSheet.create({
    containerView: {
        flex: 1,
        paddingTop: 15,
        backgroundColor: '#f4f4f4',
    },
    Button: {
        elevation: 2,
        marginVertical: 3,
        marginHorizontal: 10,
        backgroundColor: Palette.light,
        padding: 5,
    },
    TextButton: {
        color: "#0b0b0b",
        fontSize: 15,
    }
});