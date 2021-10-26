import React, {Component, Fragment} from "react";
import {View, FlatList, Text, StyleSheet,SafeAreaView, ImageBackground} from "react-native";
import {Button} from 'react-native-paper';
import {Palette} from 'src/Style/app.theme';
import Icon  from 'react-native-vector-icons/MaterialIcons';
import DeedTypeListModal from 'src/components/deedType/deedTypeListModal';

import photoStarScreen from '../../../images/bg.jpg'

import FeatherIcon from "react-native-vector-icons/Feather"
import { TouchableOpacity } from "react-native-gesture-handler";
class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground 
            source={photoStarScreen}
            style={stylesChooseADocument.imageStartScreen}
            imageStyle={stylesChooseADocument.imageStartScreen2}
            >
                {this.props.children}
            </ImageBackground>
        )
    }
}

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

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: (
                (Platform.OS == "ios") ?

                <TouchableOpacity onPress={()=>navigation.navigate('continueTitle')}>
                                <View style={{flexDirection: 'row'}}>

                                    <View >
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
            title: 'Choose a Document',
            headerStyle: {
                backgroundColor: '#006eaf',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }
    };

    render() {
        return (
            <BackgroundImage style={{flex: 1}}>
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
            </BackgroundImage>
        );
    }
}
const stylesChooseADocument = StyleSheet.create({
    containerView: {
        flex: 1,
        paddingTop: 15,
        // backgroundColor: '#f4f4f4',
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
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    }
});