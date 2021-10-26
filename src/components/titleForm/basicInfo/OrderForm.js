import React, {Component} from "react";
import {ScrollView, Text, View, StyleSheet, KeyboardAvoidingView, Platform, ImageBackground} from "react-native";
import {Header} from "react-navigation-stack";
import DatePicker from "react-native-datepicker";
import {
    Button,
    Card,
    Colors,
    Paragraph,
    RadioButton,
    TextInput,
    Title as TextTitle,
    TouchableRipple,
    withTheme,
    Divider,
    IconButton
} from "react-native-paper";
import {StackActions} from "react-navigation";
import {GooglePlacesAutocomplete} from "react-native-google-places-autocomplete";
import Icon from "react-native-vector-icons/MaterialIcons";
import AntIcon from "react-native-vector-icons/AntDesign";
import FeatherIcon from "react-native-vector-icons/Feather"
import {styles} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";
import {getManager, getConnection, getCustomRepository} from "typeorm";
import {Location, Title, TitleBuyer, TitleSeller, TitleDetail, User, OauthToken, Customer} from "src/entities/index";
import SyncService from "src/services/SyncService";
import {SYNCHRONIZE_FLAG} from "react-native-dotenv";
import moment from 'moment';
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import ModalSave from 'src/components/reusable/ModalSave';
import {
    TitleRepository,
    TitleDetailRepository,
    TitleSellerRepository,
    TitleBuyerRepository,
    CustomerRepository
} from 'src/repositories/index';

import photoStarScreen from '../../../images/bg.jpg'
import { TouchableOpacity } from "react-native-gesture-handler";
class BackgroundImage extends Component {
    render() {
        return (
            <ImageBackground 
            source={photoStarScreen}
            style={stylesOrderForm.imageStartScreen}
            imageStyle={stylesOrderForm.imageStartScreen2}
            >
                {this.props.children}
            </ImageBackground>
        )
    }
}
class OrderForm extends Component {
    constructor(props) {
        super(props);
        this.locationNameRef = React.createRef();
        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.titleRepository = getCustomRepository(TitleRepository);
        this.titleDetailRepository = getCustomRepository(TitleDetailRepository);
        this.titleSellerRepository = getCustomRepository(TitleSellerRepository);
        this.titleBuyerRepository = getCustomRepository(TitleBuyerRepository);
        this.customerRepository = getCustomRepository(CustomerRepository);

        let isResetNavigation = props.navigation.getParam('isResetNavigation', false);
        let tmpTitle = this.props.navigation.getParam('title', {
            location: {},
            searchType: 'commercial',
            searchTypeDetail: 'update',
            type: 'subdivision',
            searchTypeDetailValue: null
        });
        let tmpTitleDetail = this.props.navigation.getParam('titleDetail', {
            searchTypeTaxInformationRequest: true,
            searchTypeCopiesRequested: 'pertinent_pages_only',
        });
        this.state = {
            listViewDisplayed: 'false',
            tmpTitle: {...tmpTitle},
            tmpSellerList: [{name: ''}],
            tmpBuyerList: [{name: ''}],
            tmpTitleDetail: {...tmpTitleDetail},
            textInputSeller: [],
            textInputBuyer: [],
            showUpdate: true,
            titleOnly: '',
            showFull: false,
            saveFlag: 0,
            isResetNavigation: isResetNavigation,
            buyerRemovedList: [],
            sellerRemovedList: [],
            documentTitle: [],
            documentTitleDetail: [],
            documentSeller: [{name: ''}],
            documentBuyer: [{name: ''}],
            showModal: false,
            showMessage: false,
            tmpCustomer: [],
            documentCustomer: []
        };
        this.locationNameRef?.current?.setAddressText(tmpTitle.location.name ? tmpTitle.location.name : '');
        this.loadTitle();
        this.loadSearchType();
        this.showMessageConnection();

        this.showModalSave = this.showModalSave.bind(this);
        this.props.navigation.setParams({showModalSave: this.showModalSave});

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerLeft: (
                (Platform.OS == "ios") ?

                <TouchableOpacity onPress={navigation.getParam('showModalSave')}>
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
            )
        }
    };



    addTextInputSeller = () => {
        let tmpSellerList = this.state.tmpSellerList;
        tmpSellerList.push({name: ''});
        this.setState({tmpSellerList})
    };

    addTextInputBuyer = () => {
        let tmpBuyerList = this.state.tmpBuyerList;
        tmpBuyerList.push({name: ''});
        this.setState({tmpBuyerList});
    };

    removeTextInputSeller = (index) => {
        let {tmpSellerList, sellerRemovedList} = this.state;
        sellerRemovedList.push(tmpSellerList[index]);
        tmpSellerList.splice(index, 1);
        this.setState({tmpSellerList: tmpSellerList, sellerRemovedList: sellerRemovedList});
    };

    removeTextInputBuyer = (index) => {
        let {tmpBuyerList, buyerRemovedList} = this.state;
        buyerRemovedList.push(tmpBuyerList[index]);
        tmpBuyerList.splice(index, 1);
        this.setState({tmpBuyerList: tmpBuyerList, buyerRemovedList: buyerRemovedList});
    };

    async saveForm() {
        let {saveFlag, tmpTitle, tmpTitleDetail, tmpBuyerList, tmpSellerList, buyerRemovedList, sellerRemovedList, tmpCustomer} = this.state;
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });

            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpTitle.owner == null) {
                let userId = await AsyncStorage.getItem('user-id');
                let user = await this.manager.findOne(User, {where: {apiId: userId}});
                tmpTitle.owner = user;
            }

            await this.manager.save(Customer, tmpCustomer);
            tmpTitle.lastTitleStep = 'basicInfo';
            tmpTitle.source = 'gotitle';
            tmpTitle.customer = tmpCustomer;

            await this.manager.save(Title, tmpTitle);


            tmpTitleDetail.title = tmpTitle;
            await this.manager.save(TitleDetail, tmpTitleDetail);

            let tmpTitleBuyerList = [];
            tmpBuyerList.forEach(async (tmpBuyer) => {
                if (tmpBuyer.name.length > 0) {
                    tmpBuyer.title = tmpTitle;
                    tmpTitleBuyerList.push(tmpBuyer);
                } else
                    buyerRemovedList.push(tmpBuyer);
            });
            if (tmpTitleBuyerList.length > 0)
                await this.manager.save(TitleBuyer, tmpTitleBuyerList);

            let tmpTitleSellerList = [];
            tmpSellerList.forEach((tmpSeller) => {
                if (tmpSeller.name.length > 0) {
                    tmpSeller.title = tmpTitle;
                    tmpTitleSellerList.push(tmpSeller);
                } else
                    sellerRemovedList.push(tmpSeller);
            });
            if (tmpTitleSellerList.length > 0)
                await this.manager.save(TitleSeller, tmpTitleSellerList);

            if (SYNCHRONIZE_FLAG == 'true') {
                tmpTitle = await this.titleRepository.findOne({
                    where: {id: tmpTitle.id},
                    relations: ['titleDetail', 'location', 'customer']
                });
                tmpCustomer = tmpTitle.customer;
                await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => console.warn('OrderForm',err));
                if (tmpTitle.apiId)
                    await this.syncService.syncItem(this.customerRepository, tmpCustomer, [tmpTitle]).catch(err => console.warn('OrderForm',err));
            }

            buyerRemovedList.forEach(async (tmpBuyer) => {
                if (tmpBuyer.id){
                    await this.manager.remove(TitleBuyer, tmpBuyer);
                }
            });

            sellerRemovedList.forEach(async (tmpSeller) => {
                if (tmpSeller.id)
                    await this.manager.remove(TitleSeller, tmpSeller);
            });

            if (tmpTitleBuyerList && tmpTitleBuyerList.length > 0 && tmpTitle.apiId)
                await  this.syncService.syncList(this.titleBuyerRepository, tmpTitleBuyerList, [tmpTitle]);

            if (tmpTitleSellerList && tmpTitleSellerList.length > 0 && tmpTitle.apiId)
                await  this.syncService.syncList(this.titleSellerRepository, tmpTitleSellerList, [tmpTitle]);

            this.setState((prevState) => {
                return {...prevState, saveFlag: 0}
            });

            if (!this.state.showModal) {
                const resetAction = StackActions.reset({
                    index: 3,
                    actions: [
                        StackActions.push({routeName: 'StartScreen'}),
                        StackActions.push({routeName: 'continueTitle'}),
                        StackActions.push({
                            routeName: 'BuildMyTitle',
                            params: {
                                title: {...tmpTitle},
                                titleDetail: {...tmpTitleDetail},
                            }
                        }), StackActions.push({
                            routeName: 'LegalDescriptionForm',
                            params: {
                                title: {...tmpTitle},
                                titleDetail: {...tmpTitleDetail},
                                isResetNavigation: this.state.isResetNavigation,
                            }
                        }),
                    ],
                });
                this.props.navigation.dispatch(resetAction);
            } else {
                this.props.navigation.goBack();
            }
            this.setState({showModal: false});
        }
    }

    async loadTitle() {
        if (!this.connection.isConnected)
            await this.connection.connect();
        let tmpTitle = await this.manager.findOne(Title, {
            where: {id: this.state.tmpTitle.id},
            relations: ['location', 'customer', 'owner', 'titleDetail']
        });
        let customer = {title: tmpTitle};
        let userId = await AsyncStorage.getItem('user-id');
        let user = await this.manager.findOne(User, {where: {apiId: userId}});

        if (tmpTitle == null) {
            tmpTitle = {
                location: {},
                searchType: 'commercial',
                searchTypeDetail: 'update',
                type: 'subdivision',
                searchTypeDetailValue: null
            };
            customer = {};
        } else {
            customer = tmpTitle.customer;
            if (!customer)
                customer = {title: tmpTitle};
        }

        let titleBuyer = await this.manager.find(TitleBuyer, {where: {title: this.state.tmpTitle}});
        let buyer = titleBuyer;
        if (titleBuyer == null || titleBuyer.length === 0) {
            titleBuyer = [{name: ''}];
        }
        if (buyer == null || buyer.length === 0) {
            buyer = [{name: ''}];
        }

        let titleSeller = await this.manager.find(TitleSeller, {where: {title: this.state.tmpTitle}});
        let seller = titleSeller;
        if (titleSeller == null || titleSeller.length === 0) {
            titleSeller = [{name: ''}];
        }
        if (seller == null || seller.length === 0) {
            seller = [{name: ''}];
        }


        let titleDetail = await this.manager.findOne(TitleDetail, {where: {title: this.state.tmpTitle}});
        if (titleDetail == null) {
            titleDetail = {
                isOpenSection: false,
                searchTypeTaxInformationRequest: true,
                searchTypeCopiesRequested: 'pertinent_pages_only',
            };
        }

        if (!tmpTitle.owner)
            tmpTitle.owner = user;

        this.setState({
            tmpTitleDetail: titleDetail,
            tmpBuyerList: titleBuyer,
            tmpSellerList: titleSeller,
            documentTitle: {...tmpTitle},
            documentTitleDetail: {...titleDetail},
            documentSeller: [...seller],
            documentBuyer: [...buyer],
            tmpCustomer: customer,
            documentCustomer: {...customer},
            tmpTitle: tmpTitle,
            tmpLocationName: tmpTitle.location && tmpTitle.location.name ? tmpTitle.location.name : ''
        });
        this.locationNameRef?.current?.setAddressText(tmpTitle.location && tmpTitle.location.name ? tmpTitle.location.name : '');
    }

    getAddressType = (place = null, componentTemplate) => {
        let result;
        if (place === null)
            return;
        for (let i = 0; i < place.address_components.length; i++) {
            let addressType = place.address_components[i].types[0];
            if (componentTemplate[addressType]) {
                result = place.address_components[i][componentTemplate[addressType]];
                return result;
            }
        }
        return;
    };

    loadSearchType() {

        let tmpTitle = this.state.tmpTitle;
        if (tmpTitle.searchTypeDetail === 'limited' || tmpTitle.searchTypeDetail === 'full') {
            this.state.showUpdate = false;
            this.state.showFull = true;
        }
        if (tmpTitle.searchTypeDetail === 'update') {
            this.state.showFull = false;
            this.state.showUpdate = true;
        }
    }

    ShowHideComponentUpdate = () => {
        if (this.state.tmpTitle.searchTypeDetail !== 'update') {
            this.setState((prevState) => {
                return {
                    ...prevState,
                    showFull: false,
                    tmpTitle: {...prevState.tmpTitle, searchTypeDetail: 'update'},
                    showUpdate: true
                }
            });
        }
    };

    ShowHideComponentLimited = () => {
        if (this.state.tmpTitle.searchTypeDetail !== 'limited') {
            this.state.tmpTitle.searchTypeDetailValue = null;
            this.setState((prevState) => {
                return {
                    ...prevState,
                    showUpdate: false,
                    showFull: true,
                    tmpTitle: {...prevState.tmpTitle, searchTypeDetail: 'limited'}

                }
            });
        }
    };

    ShowHideComponentFull = () => {
        if (this.state.tmpTitle.searchTypeDetail !== 'full') {
            this.state.tmpTitle.searchTypeDetailValue = null;
            this.setState((prevState) => {
                return {
                    ...prevState,
                    showUpdate: false,
                    showFull: true,
                    tmpTitle: {...prevState.tmpTitle, searchTypeDetail: 'full'}
                }
            });
        }
    };

    showModalSave() {
        let {
            documentTitle,
            documentTitleDetail,
            tmpTitle,
            tmpTitleDetail,
            tmpSellerList,
            tmpBuyerList,
            tmpCustomer
        } = this.state;
        let documentSeller = this.state.documentSeller;
        let documentBuyer = this.state.documentBuyer;
        let documentCustomer = this.state.documentCustomer;

        if (JSON.stringify(documentTitle) !== JSON.stringify(tmpTitle) ||
            JSON.stringify(documentTitleDetail) !== JSON.stringify(tmpTitleDetail) ||
            JSON.stringify(tmpBuyerList) !== JSON.stringify(documentBuyer) ||
            JSON.stringify(tmpSellerList) !== JSON.stringify(documentSeller) ||
            JSON.stringify(tmpCustomer) !== JSON.stringify(documentCustomer)
        ) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

    showMessageConnection() {
        let showMessage = this.state.showMessage;
        NetInfo.addEventListener(state => {

            if (state.isConnected) {
                showMessage = false;
            } else {
                showMessage = true;

            }
        });
        this.state.showMessage = showMessage;
    };

    render() {
        return (
            <BackgroundImage>
                    <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                    behavior={Platform.OS == "ios" ? "padding" : null}
                                    enabled={Platform.OS == "ios" ? true : false}
                                    keyboardVerticalOffset={Header.HEIGHT + 20}>
                    <ScrollView contentContainerStyle={{flexGrow: 1}}
                                keyboardShouldPersistTaps="handled">
                        <View style={styles.containerFlat}>

                            {
                                (this.state.showMessage) ?
                                    <Card style={stylesOrderForm.cards}>
                                        <Card.Content>
                                            <View style={{flex: 1, flexDirection: 'row'}}>
                                                <IconButton
                                                    icon="alert"
                                                    color="white"
                                                />
                                                <Text style={{textAlign: 'justify', color: '#fff', marginVertical: 15}}>
                                                    Connect to internet to verify Address
                                                </Text>


                                            </View>
                                        </Card.Content>
                                    </Card> : null
                            }

                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Nearest Map Address:</Text>
                                    </View>
                                    
                                    {/* <View style={{borderRadius: 12,borderWidth: 1, borderColor: Palette.primary,height: 52}}> */}
                                        <View>
                                            <GooglePlacesAutocomplete
                                                ref={this.locationNameRef}
                                                placeholder=""
                                                
                                                minLength={3} // minimum length of text to search
                                                autoFocus={false}
                                                fetchDetails={true}
                                                // keyboardShouldPersistTaps="handled"
                                                listViewDisplayed={this.state.listViewDisplayed}
                                                onPress={(data, details = null) => {
                                                    let {tmpTitle} = this.state;
                                                    let location = tmpTitle.location;
                                                    if (!location) location = {name:''};
                                                    if (tmpTitle.legalAddress == null || tmpTitle.legalAddress.trim().length == 0 || tmpTitle.location.name == tmpTitle.legalAddress) {
                                                        tmpTitle.legalAddress=data.description;
                                                    }
                                                    tmpTitle.location = {
                                                        ...location,
                                                        name: data.description,
                                                        placeId: data.place_id,
                                                        country: this.getAddressType(details, {country: 'long_name'}),
                                                        countryCode: this.getAddressType(details, {country: 'short_name'}),
                                                        city: this.getAddressType(details, {locality: 'long_name'}),
                                                        state: this.getAddressType(details, {administrative_area_level_1: 'short_name'}),
                                                        district: this.getAddressType(details, {administrative_area_level_2: 'short_name'}),
                                                        latitude: details.geometry.location.lat,
                                                        longitude: details.geometry.location.lng
                                                    };
                                                    this.setState({tmpTitle: tmpTitle, listViewDisplayed: 'false'});
                                                }}
                                                textInputProps={{
                                                    onChangeText: (name) => {
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                tmpLocationName: name,
                                                                listViewDisplayed: 'auto'
                                                            };
                                                        });
                                                    },
                                                    onBlur: () => {
                                                        this.setState((prevState) => {
                                                            this.locationNameRef?.current?.setAddressText(prevState.tmpTitle.location && prevState.tmpTitle.location.name ? prevState.tmpTitle.location.name : '')
                                                            return {
                                                                ...prevState,
                                                                listViewDisplayed: 'false',
                                                                tmpLocationName: prevState.tmpTitle.location?prevState.tmpTitle.location.name:''
                                                            };
                                                        });
                                                    }
                                                }}
                                                styles={[this.props.theme.formGooglePlace, {paddingLeft: 10}]}
                                                query={{
                                                    key: 'AIzaSyASJsWPNP8YL4Ni95gPQchanpWkUkleWJo',
                                                    language: 'en', // language of the results
                                                    components: 'country:US'
                                                }}
                                            />
                                        </View>
                                    {/* </View> */}
                                    {/* <Divider style={{backgroundColor:Palette.darkGray}}/> */}
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Legal Address:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary, justifyContent: 'center'}}>
                                        <TextInput
                                            style={[styles.formControl, {marginBottom: 10}]}
                                            label=""
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpTitle.legalAddress}
                                            onChangeText={(legalAddress) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpTitle: {
                                                            ...prevState.tmpTitle,
                                                            legalAddress: legalAddress
                                                        }
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>State:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                    <TextInput
                                        style={styles.formControl}
                                        label=''
                                        backgroundColor="#fff"
                                        mode= "flat"
                                        underlineColor="none"
                                        value={this.state.tmpTitle.location ? this.state.tmpTitle.location.state : null}
                                        disabled={false}
                                        editable={false}
                                        onChangeText={(text) => {
                                        }}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.graytextinput,
                                                text: Palette.graytextinput,
                                                primary: Palette.primary,
                                                underlineColor: 'transparent',
                                                background: '#F2F2F2'
                                            }
                                        }}
                                    />
                                    </View>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>County:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            label=''
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpTitle.location ? this.state.tmpTitle.location.district : null}
                                            disabled={false}
                                            editable={false}
                                            onChangeText={(text) => {
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    {/* <View style={{flexDirection: "row"}}> */}
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Condo/Unit/Apartment:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            // style={stylesOrderForm.formControl}
                                            label=''
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpTitle.apartment}
                                            onChangeText={(apartment) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpTitle: {...prevState.tmpTitle, apartment: apartment}
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    {/* </View> */}
                                </Card.Content>
                            </Card>

                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Company Name:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            label=""
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpCustomer.companyName}
                                            onChangeText={(companyName) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpCustomer: {
                                                            ...prevState.tmpCustomer,
                                                            companyName: companyName
                                                        }
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>File Number:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            label=""
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpCustomer.fileNumber ? String(this.state.tmpCustomer.fileNumber) : ''}
                                            onChangeText={(fileNumber) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpCustomer: {
                                                            ...prevState.tmpCustomer,
                                                            fileNumber: fileNumber
                                                        }
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Client Name:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            label=""
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpCustomer.name}
                                            onChangeText={(name) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpCustomer: {
                                                            ...prevState.tmpCustomer,
                                                            name: name
                                                        }
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Client File Number:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            label=""
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpCustomer.companyFileNumber}
                                            onChangeText={(companyFileNumber) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpCustomer: {
                                                            ...prevState.tmpCustomer,
                                                            companyFileNumber: companyFileNumber
                                                        }
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Client Address:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            style={styles.formControl}
                                            label=""
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            value={this.state.tmpCustomer.clientAddress}
                                            onChangeText={(clientAddress) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpCustomer: {
                                                            ...prevState.tmpCustomer,
                                                            clientAddress: clientAddress
                                                        }
                                                    }
                                                });
                                            }}
                                            theme={{
                                                colors: {
                                                    placeholder: Palette.graytextinput,
                                                    text: Palette.graytextinput,
                                                    primary: Palette.primary,
                                                    underlineColor: 'transparent',
                                                    background: '#F2F2F2'
                                                }
                                            }}
                                        />
                                    </View>
                                </Card.Content>

                            </Card>

                            <Card style={styles.card}>
                                <Card.Content>
                                    <TextTitle>
                                        Buyers:
                                    </TextTitle>
                                    {this.state.tmpBuyerList.map((values, index) => {
                                        return <View style={[(index <= 0) ? {marginRight: 30} : null]}>
                                                <View style={stylesOrderForm.formRow}>
                                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                        <TextInput
                                                            mode= "flat"
                                                            placeholder={"Buyers " + (index +1)}
                                                            backgroundColor="#fff"
                                                            underlineColor="none"
                                                            style={styles.formControl}
                                                            // label={"Buyer " + (index + 1)}
                                                            value={this.state.tmpBuyerList[index].name}
                                                            onChangeText={(name) => {
                                                                let tmpBuyerList = this.state.tmpBuyerList;
                                                                let tmpBuyer = tmpBuyerList[index];
                                                                tmpBuyer.name = name;
                                                                tmpBuyerList[index] = tmpBuyer;
                                                                this.setState((prevState) => {
                                                                    return {...prevState, tmpBuyerList: tmpBuyerList}
                                                                });
                                                            }}
                                                            theme={{
                                                                colors: {
                                                                    placeholder: Palette.graytextinput,
                                                                    text: Palette.graytextinput,
                                                                    primary: Palette.primary,
                                                                    underlineColor: 'transparent',
                                                                    background: '#F2F2F2'
                                                                }
                                                            }}
                                                        />
                                                    </View>
                                                    {
                                                        (index > 0) ?
                                                            <View>
                                                                <TouchableRipple
                                                                    onPress={() => this.removeTextInputBuyer(index)}>
                                                                    <Icon name="remove-circle-outline" size={30}
                                                                        color="red"/>
                                                                </TouchableRipple>
                                                            </View>
                                                            : null
                                                    }
                                            </View>
                                        </View>;
                                    })}
                                    <View style={{paddingTop: 10}}>
                                        <Button
                                            labelStyle={{fontWeight: 'bold'}}
                                            style={stylesOrderForm.ButtonOrderForm}
                                            mode="contained"
                                            uppercase={false}
                                            onPress={() => this.addTextInputBuyer(this.state.textInputBuyer.length)}>
                                            Add more buyers
                                        </Button>
                                    </View>
                                </Card.Content>

                            </Card>

                            <Card style={styles.card}>
                                <Card.Content>
                                    <TextTitle>
                                        Sellers:
                                    </TextTitle>

                                    {this.state.tmpSellerList.map((value, index) => {
                                        return <View style={[(index <= 0) ? {marginRight: 30} : null]}>
                                            <View style={stylesOrderForm.formRow}>
                                                <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                    <TextInput
                                                        mode= "flat"
                                                        backgroundColor="#fff"
                                                        underlineColor="none"
                                                        style={styles.formControl}
                                                        placeholder={"Sellers  " + (index +1)}
                                                        value={this.state.tmpSellerList[index].name}
                                                        onChangeText={(name) => {
                                                            let tmpSellerList = this.state.tmpSellerList;
                                                            let tmpSeller = tmpSellerList[index];
                                                            tmpSeller.name = name;
                                                            tmpSellerList[index] = tmpSeller;

                                                            this.setState((prevState) => {
                                                                return {...prevState, tmpSellerList: tmpSellerList}
                                                            });
                                                        }}
                                                        theme={{
                                                            colors: {
                                                                placeholder: Palette.graytextinput,
                                                                text: Palette.graytextinput,
                                                                primary: Palette.primary,
                                                                underlineColor: 'transparent',
                                                                background: '#F2F2F2'
                                                            }
                                                        }}
                                                    />
                                                </View> 
                                                    {
                                                        (index > 0) ?
                                                            <View>
                                                                <TouchableRipple
                                                                    onPress={() => this.removeTextInputSeller(index)}>
                                                                    <Icon name="remove-circle-outline" size={30}
                                                                        color="red"/>
                                                                </TouchableRipple>
                                                            </View>
                                                            : null

                                                    }          
                                            </View>
                                        </View>;
                                    })}
                                    <View style={{paddingTop: 10}}>
                                        <Button
                                            labelStyle={{fontWeight: 'bold'}}
                                            style={stylesOrderForm.ButtonOrderForm}
                                            mode="contained"
                                            uppercase={false}
                                            onPress={() => this.addTextInputSeller(this.state.textInputSeller.length)}>
                                            Add more sellers
                                        </Button>
                                    </View>

                                </Card.Content>
                            </Card>

                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={{marginBottom: 10, fontWeight: "bold"}}>Search Type :</Text>
                                    <View style={{flexDirection: "row"}}>
                                        <View style={{flex: 1}}>
                                            <TouchableRipple
                                                style={{alignItems: 'center'}}
                                                onPress={() => {
                                                    this.setState((prevState) => {
                                                        return {
                                                            ...prevState,
                                                            tmpTitle: {...prevState.tmpTitle, searchType: 'commercial'}
                                                        }
                                                    });
                                                }}>
                                                <View
                                                    style={{alignItems: 'center'}}>
                                                    <Paragraph>Commercial</Paragraph>
                                                    <View pointerEvents="none">
                                                        <RadioButton
                                                            value="commercial"
                                                            color={Colors.blue100}
                                                            status={
                                                                this.state.tmpTitle.searchType === 'commercial' ? 'checked' : 'unchecked'
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableRipple>
                                        </View>

                                        <View style={{flex: 1}}>
                                            <TouchableRipple
                                                style={{alignItems: 'center'}}
                                                onPress={() => {
                                                    this.setState((prevState) => {
                                                        return {
                                                            ...prevState,
                                                            tmpTitle: {...prevState.tmpTitle, searchType: 'residential'}
                                                        }
                                                    });
                                                }}
                                            >
                                                <View style={{alignItems: 'center'}}>
                                                    <Paragraph>Residential</Paragraph>
                                                    <View pointerEvents="none">
                                                        <RadioButton
                                                            value="residential"
                                                            color={Colors.blue100}
                                                            status={
                                                                this.state.tmpTitle.searchType === 'residential' ? 'checked' : 'unchecked'
                                                            }
                                                        />
                                                    </View>
                                                </View>
                                            </TouchableRipple>
                                        </View>
                                    </View>

                                    <TouchableRipple
                                        onPress={() => this.ShowHideComponentUpdate()}>
                                        <View style={styles.groupRow}>
                                            <Paragraph>Update</Paragraph>
                                            <View pointerEvents="none">
                                                <RadioButton
                                                    value="update"
                                                    color={Colors.blue100}
                                                    status={
                                                        this.state.tmpTitle.searchTypeDetail === 'update' ? 'checked' : 'unchecked'
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableRipple>
                                    <Divider style={styles.divideForm}/>
                                    <View>
                                        {this.state.tmpTitle.searchTypeDetail === 'update' ? (
                                            <View>
                                                <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                                    <Text style={{fontWeight: 'bold', color: "#000"}}>Date Title Updated From:</Text>
                                                </View>
                                                <DatePicker
                                                    date={this.state.tmpTitle.searchTypeDetailValue}
                                                    style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                                    mode="date"
                                                    placeholder=" "
                                                    format="YYYY-MM-DD"
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    iconComponent={
                                                        <Icon style={{position: 'absolute', right: 0, marginRight: 10}}
                                                            name="date-range"
                                                            size={25} color="#757575"/>}
                                                    customStyles={this.props.theme.formDatePicker}
                                                    onDateChange={(searchTypeDetailValue) => {
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                tmpTitle: {
                                                                    ...prevState.tmpTitle,
                                                                    searchTypeDetail: 'update',
                                                                    searchTypeDetailValue: moment(searchTypeDetailValue).format("YYYY/MM/DD")
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />
                                            </View>
                                        ) : null}
                                    </View>

                                    <TouchableRipple
                                        onPress={() => {
                                            if (this.state.tmpTitle.searchTypeDetail !== 'currentOwner') {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        showUpdate: false,
                                                        showFull: false,
                                                        tmpTitle: {
                                                            ...prevState.tmpTitle,
                                                            searchTypeDetail: 'currentOwner',
                                                            searchTypeDetailValue: null
                                                        }
                                                    }
                                                });
                                            }
                                        }}>
                                        <View style={styles.groupRow}>
                                            <Paragraph>Current Owner</Paragraph>
                                            <View pointerEvents="none">
                                                <RadioButton
                                                    value="currentOwner"
                                                    color={Colors.blue100}
                                                    status={
                                                        this.state.tmpTitle.searchTypeDetail === 'currentOwner' ? 'checked' : 'unchecked'
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableRipple>
                                    <Divider style={styles.divideForm}/>
                                    <TouchableRipple
                                        onPress={() => this.ShowHideComponentLimited()}>
                                        <View style={styles.groupRow}>
                                            <Paragraph>Limited</Paragraph>
                                            <View pointerEvents="none">
                                                <RadioButton
                                                    value="limited"
                                                    color={Colors.blue100}
                                                    status={
                                                        this.state.tmpTitle.searchTypeDetail === 'limited' ? 'checked' : 'unchecked'
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableRipple>
                                    <Divider style={styles.divideForm}/>
                                    <TouchableRipple
                                        onPress={() => this.ShowHideComponentFull()}>
                                        <View style={styles.groupRow}>
                                            <Paragraph>Full</Paragraph>
                                            <View pointerEvents="none">
                                                <RadioButton
                                                    value="full"
                                                    color={Colors.blue100}
                                                    status={
                                                        this.state.tmpTitle.searchTypeDetail === 'full' ? 'checked' : 'unchecked'
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableRipple>
                                    <Divider style={styles.divideForm}/>
                                    {this.state.showFull ? (
                                        <View>
                                            <View style={[styles.formRow, styles.divideForm]}>
                                                <Text style={styles.formLabel}>Years Searched:</Text>
                                            </View>
                                            <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                <TextInput
                                                style={styles.formControl}
                                                label=""
                                                mode= "flat"
                                                backgroundColor="#fff"
                                                underlineColor="none"
                                                keyboardType="numeric"
                                                maxLength={3}
                                                value={this.state.tmpTitle.searchTypeDetailValue}
                                                theme={{
                                                    colors: {
                                                        placeholder: Palette.graytextinput,
                                                        text: Palette.graytextinput,
                                                        primary: Palette.primary,
                                                        underlineColor: 'transparent',
                                                        background: '#F2F2F2'
                                                    }
                                                }}
                                                onChangeText={(searchTypeDetailValue) => {
                                                    this.setState((prevState) => {
                                                        return {
                                                            ...prevState,
                                                            tmpTitle: {
                                                                ...prevState.tmpTitle,
                                                                searchTypeDetailValue: searchTypeDetailValue,
                                                            }
                                                        }
                                                    });
                                                }}>
                                                    
                                                </TextInput>
                                            </View>
                                        </View>
                                        
                                    ) : null}

                                    <View style={{flexDirection: "row", marginVertical: 10}}>
                                        <View style={[stylesOrderForm.textOrderForm, {paddingTop: 7}]}>
                                            <Paragraph style={{fontWeight: 'bold', color:"#000"}}>Tax Information Requested:</Paragraph>
                                        </View>
                                        <View style={{flexDirection: "row", marginLeft: 3}}>
                                            <View style={{marginRight: 20}}>
                                                <TouchableRipple
                                                    onPress={() => {
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                tmpTitleDetail: {
                                                                    ...prevState.tmpTitleDetail,
                                                                    searchTypeTaxInformationRequest: true
                                                                }
                                                            }
                                                        });
                                                    }}>
                                                    <View style={{alignItems: 'center'}}>
                                                        <Paragraph>Yes</Paragraph>
                                                        <View pointerEvents="none">
                                                            <RadioButton
                                                                value={true}
                                                                color={Colors.blue100}
                                                                status={
                                                                    this.state.tmpTitleDetail.searchTypeTaxInformationRequest == true ? 'checked' : 'unchecked'
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableRipple>
                                            </View>

                                            <View>
                                                <TouchableRipple
                                                    onPress={() => {
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                tmpTitleDetail: {
                                                                    ...prevState.tmpTitleDetail,
                                                                    searchTypeTaxInformationRequest: false
                                                                }
                                                            }
                                                        });
                                                    }}>
                                                    <View style={{alignItems: 'center'}}>
                                                        <Paragraph>No</Paragraph>
                                                        <View pointerEvents="none">
                                                            <RadioButton
                                                                value={false}
                                                                color={Colors.blue100}
                                                                status={
                                                                    this.state.tmpTitleDetail.searchTypeTaxInformationRequest == false ? 'checked' : 'unchecked'
                                                                }
                                                            />
                                                        </View>
                                                    </View>
                                                </TouchableRipple>
                                            </View>
                                        </View>
                                    </View>

                                    <Text style={{fontWeight: 'bold'}}>Copies Requested:</Text>
                                    <TouchableRipple
                                        onPress={() => {
                                            this.setState((prevState) => {
                                                return {
                                                    ...prevState,
                                                    tmpTitleDetail: {
                                                        ...prevState.tmpTitleDetail,
                                                        searchTypeCopiesRequested: 'pertinent_pages_only'
                                                    },
                                                    titleOnly: 'pertinent_pages_only'
                                                }
                                            });
                                        }}
                                    >
                                        <View style={styles.groupRow}>
                                            <Paragraph>Pertinent Pages Only</Paragraph>
                                            <View pointerEvents="none">
                                                <RadioButton
                                                    value="pertinent_pages_only"
                                                    color={Colors.blue100}
                                                    status={
                                                        this.state.tmpTitleDetail.searchTypeCopiesRequested === 'pertinent_pages_only' ? 'checked' : 'unchecked'
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableRipple>
                                    <Divider style={styles.divideForm}/>
                                    <TouchableRipple
                                        onPress={() => {
                                            this.setState((prevState) => {
                                                return {
                                                    ...prevState,
                                                    tmpTitleDetail: {
                                                        ...prevState.tmpTitleDetail,
                                                        searchTypeCopiesRequested: 'full_copies'
                                                    },
                                                    titleOnly: 'full_copies'
                                                }
                                            });
                                        }}
                                    >
                                        <View style={styles.groupRow}>
                                            <Paragraph>Full Copies</Paragraph>
                                            <View pointerEvents="none">
                                                <RadioButton
                                                    value="full_copies"
                                                    color={Colors.blue100}
                                                    status={
                                                        this.state.tmpTitleDetail.searchTypeCopiesRequested === 'full_copies' ? 'checked' : 'unchecked'
                                                    }
                                                />
                                            </View>
                                        </View>
                                    </TouchableRipple>
                                    <Divider style={styles.divideForm}/>

                                </Card.Content>
                            </Card>

                            <Card style={styles.card}>
                                <Card.Content>
                                <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Special Instructions:</Text>
                                </View>
                                <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary,}}>
                                    <TextInput
                                        multiline
                                        style={styles.formControl}
                                        underlineColor="none"
                                        mode="flat"
                                        backgroundColor="#fff"
                                        label=""
                                        value={this.state.tmpTitleDetail.specialInstructions}
                                        onChangeText={(specialInstructions) => {

                                            this.setState((prevState) => {
                                                return {
                                                    ...prevState,
                                                    tmpTitleDetail: {
                                                        ...prevState.tmpTitleDetail,
                                                        specialInstructions: specialInstructions
                                                    }
                                                }
                                            });
                                        }}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.graytextinput,
                                                text: Palette.graytextinput,
                                                primary: Palette.primary,
                                                underlineColor: 'transparent',
                                                background: '#F2F2F2'
                                            }
                                        }}

                                    />
                                </View>
                                </Card.Content>
                            </Card>


                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                        <Text style={styles.formLabel}>Date Searched:</Text>
                                    </View>
                                    <DatePicker
                                        date={this.state.tmpTitle.dateSearch}
                                        style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                        mode="date"
                                        placeholder=" "
                                        format="YYYY-MM-DD"
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        iconComponent={
                                            <Icon style={{position: 'absolute', right: 0, marginRight: 10}}
                                                name="date-range"
                                                size={25} color="#757575"/>}
                                        customStyles={this.props.theme.formDatePicker}
                                        onDateChange={(dateSearch) => {
                                            this.setState((prevState) => {
                                                return {
                                                    ...prevState,
                                                    tmpTitle: {
                                                        ...prevState.tmpTitle,
                                                        dateSearch: moment(dateSearch).format("YYYY/MM/DD")
                                                    }
                                                }
                                            });
                                        }}
                                    />

                                    <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                        <Text style={styles.formLabel}>Date Effective:</Text>
                                    </View>
                                    <DatePicker
                                        date={this.state.tmpTitle.dateEffective}
                                        style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                        mode="date"
                                        placeholder=" "
                                        format="YYYY-MM-DD"
                                        confirmBtnText="Confirm"
                                        cancelBtnText="Cancel"
                                        iconComponent={
                                            <Icon style={{position: 'absolute', right: 0, marginRight: 10}}
                                                name="date-range"
                                                size={25} color="#757575"/>}
                                        customStyles={this.props.theme.formDatePicker}
                                        onDateChange={(dateEffective) => {
                                            this.setState((prevState) => {
                                                return {
                                                    ...prevState,
                                                    tmpTitle: {
                                                        ...prevState.tmpTitle,
                                                        dateEffective: moment(dateEffective).format("YYYY/MM/DD")
                                                    }
                                                }
                                            });
                                        }}
                                    />
                                </Card.Content>
                            </Card>

                            { (this.state.showModal) ?
                                <ModalSave
                                    visible={this.state.showModal}
                                    onDismiss={() => {
                                        this.setState((prevState) => {
                                            return {
                                                ...prevState,
                                                showModal: false
                                            }
                                        });
                                    }}
                                    onSave={() => {
                                        this.saveForm()
                                    }}
                                    onNoSave={() => {
                                        this.setState((prevState) => {
                                            return {
                                                ...prevState,
                                                showModal: false
                                            }
                                        });
                                        this.props.navigation.goBack();
                                    }}
                                /> : null
                            }

                            <Button
                                labelStyle={{fontWeight: 'bold'}}
                                style={[styles.screenButton, {marginBottom: 25}]} mode="contained"
                                uppercase={false}
                                onPress={() => {
                                    this.saveForm();
                                }}
                            >{this.state.saveFlag?'Saving...':'Continue'}</Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BackgroundImage>
           
        );
    }
}

export default withTheme(OrderForm);


const stylesOrderForm = StyleSheet.create({

        formControl: {
            flex: 1,
            backgroundColor: "transparent",
            margin: 5
        },
        ButtonOrderForm: {
            height: 50,
            justifyContent: 'center',
            alignItems: 'center',
            flex: 1,
            borderRadius: 12
        },
        textOrderForm: {
            margin: 25,
            marginRight: 20,
            marginLeft: 0,
        },
        formRow: {
            flexDirection: "row",
            alignItems: "center",
            marginTop: 0,
            marginVertical: 5,
        },
        cards: {
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.37,
            shadowRadius: 12,
            elevation: 2,
            marginVertical: 5,
            backgroundColor: '#d9534f',
        },
        imageStartScreen: {
            height: '100%',
        },
        imageStartScreen2: {
            resizeMode: 'cover'
        }
    });
