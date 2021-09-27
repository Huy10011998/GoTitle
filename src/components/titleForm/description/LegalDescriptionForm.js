import React, {Component} from "react";
import {ScrollView, View, StyleSheet, KeyboardAvoidingView, Platform} from "react-native";
import {Header} from "react-navigation-stack";
import {
    Card,
    RadioButton,
    TextInput,
    Colors,
    Switch,
    Button,
    Text,
    TouchableRipple,
    IconButton
} from "react-native-paper";
import {StackActions} from "react-navigation";
import FormCheckBox from "./FormCheckbox";
import {styles} from "src/Style/app.style";
import {getConnection, getManager, getCustomRepository} from "typeorm";
import {Title, TitleDetail, TitleBookPage} from "src/entities/index";
import Icon from 'react-native-vector-icons/MaterialIcons';
import SyncService from "src/services/SyncService";
import ModalSave from 'src/components/reusable/ModalSave';
import {
    TitleRepository,
    TitleDetailRepository,
    TitleBookPageRepository
} from 'src/repositories/index';


export default class LegalDescriptionForm extends Component {

    constructor(props) {
        super(props);

        this.titleRepository = getCustomRepository(TitleRepository);
        this.titleDetailRepository = getCustomRepository(TitleDetailRepository);
        this.titleBookPageRepository = getCustomRepository(TitleBookPageRepository);

        let isResetNavigation = props.navigation.getParam('isResetNavigation', false);
        let title = props.navigation.getParam('title', {type: 'subdivision'});
        let titleDetail = props.navigation.getParam('titleDetail', {isOpenSection: false});
        this.syncService = new SyncService();
        this.state = {
            tmpTitle: {...title},
            tmpTitleDetail: {...titleDetail},
            isResetNavigation: isResetNavigation,
            edited: false,
            showSection: false,
            tmpPlatBookPageList: [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'plat',
            }],
            tmpRevisedBookPageList: [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'revised',
            }],
            tmpFloorBookPageList: [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'floor_plans',
            }],
            tmpFloorRevisedBookPageList: [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'revised_floor_plans',
            }],
            inputPlatBookPage: [],
            inputRevisedBookPage: [],
            inputFloorBookPage: [],
            inputFloorRevisedBookPage: [],
            showSubdivision: true,
            showMetesBounds: true,
            showChangeSection: false,
            showBookPage: true,
            showMaster: true,
            saveFlag: 0,
            showTractAcres: false,
            bookPageRemoveList: [],
            documentTitle: {...title},
            documentTitleDetail: {...titleDetail},
            documentPlat: [],
            documentRevised: [],
            documentFloor: [],
            documentFloorRevised: [],
            showModal: false
        };
        this.manager = getManager();
        this.connection = getConnection();
        this.loadTitle();
        this.loadSearchType();

        this.showModalSave = this.showModalSave.bind(this);
        this.props.navigation.setParams({showModalSave: this.showModalSave});

    }

    static navigationOptions = ({navigation}) => {

        return {

            headerLeft: (
                (Platform.OS == "ios") ?
                    <Button
                        uppercase={false}
                        color={'#eee'}
                        onPress={navigation.getParam('showModalSave')}
                    ><Text style={{fontSize: 17}}>Back</Text></Button> :
                    <IconButton
                        icon="arrow-left" color="white" size={25}
                        onPress={navigation.getParam('showModalSave')}/>

            )
        }
    };

    async loadTitle() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        let {tmpTitle} = this.state;
        let title = await this.manager.findOne(Title, {where: {id: tmpTitle.id}, relations: ['location', 'owner']});

        if (title.type == null)
            title.type = 'subdivision';

        let titleDetail = await this.manager.findOne(TitleDetail, {
            where: {title: this.state.tmpTitle},
            relations: ['title']
        });
        if (titleDetail == null) {
            titleDetail = {
                isOpenSection: false,
                searchTypeTaxInformationRequest: true,
                searchTypeCopiesRequested: 'pertinent_pages_only',
            };
        }


        let platBookPageList = await this.manager.find(TitleBookPage, {
            where: {
                title: this.state.tmpTitle,
                type: 'plat'
            }
        });
        let plat = platBookPageList;
        if (platBookPageList == null || platBookPageList.length === 0) {
            platBookPageList = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'plat',
            }];
            plat = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'plat',
            }];
        }

        let revisedBookPageList = await this.manager.find(TitleBookPage, {
            where: {
                title: this.state.tmpTitle,
                type: 'revised'
            }
        });
        let revised = revisedBookPageList;
        if (revisedBookPageList == null || revisedBookPageList.length === 0) {
            revisedBookPageList = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'revised',
            }];
            revised = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'revised',
            }];
        }

        let floorBookPageList = await this.manager.find(TitleBookPage, {
            where: {
                title: this.state.tmpTitle,
                type: 'floor_plans'
            }
        });
        let floor = floorBookPageList;
        if (floorBookPageList == null || floorBookPageList.length === 0) {
            floorBookPageList = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'floor_plans',
            }];
            floor = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'floor_plans',
            }];
        }

        let floorRevisedBookPageList = await this.manager.find(TitleBookPage, {
            where: {
                title: this.state.tmpTitle,
                type: 'revised_floor_plans'
            }
        });
        let floorRevised = floorRevisedBookPageList;
        if (floorRevisedBookPageList == null || floorRevisedBookPageList.length === 0) {
            floorRevisedBookPageList = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'revised_floor_plans',
            }];
            floorRevised = [{
                book: '',
                page: '',
                withoutBookPageInfo: '',
                type: 'revised_floor_plans',
            }]

        }


        this.setState((prevState) => {
            return {
                ...prevState,
                tmpTitle: title,
                tmpTitleDetail: titleDetail,
                tmpPlatBookPageList: platBookPageList,
                tmpRevisedBookPageList: revisedBookPageList,
                tmpFloorBookPageList: floorBookPageList,
                tmpFloorRevisedBookPageList: floorRevisedBookPageList,
                documentTitle: {...title},
                documentTitleDetail: {...titleDetail},
                documentPlat: [...plat],
                documentRevised: [...revised],
                documentFloor: [...floor],
                documentFloorRevised: [...floorRevised],
            }
        });

        if (this.state.tmpTitle !== null) {
            this.setState({documentLegalDescription: this.state.tmpTitle})
        }
    }

    async saveForm() {

        let tmpTitle = this.state.tmpTitle;
        let tmpTitleDetail = this.state.tmpTitleDetail;
        let saveFlag = this.state.saveFlag;

        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (tmpTitleDetail.isOpenSection === true) {
                tmpTitle.district = null;
                tmpTitle.landLot = null;
            } else {
                tmpTitle.township = null;
                tmpTitle.range = null;
                tmpTitle.zones = null;
            }

            if (tmpTitle.type === 'subdivision' || tmpTitle.type === 'condominium') {
                tmpTitle.longLegal = null;
            } else {
                this.clearSubdivisionCondominium();
            }

            if (!this.connection.isConnected)
                await this.connection.connect();

            tmpTitle.lastTitleStep = 'legalDescription';

            await this.manager.save(Title, tmpTitle);
            tmpTitleDetail.title = tmpTitle;
            await this.manager.save(TitleDetail, tmpTitleDetail);

            let {bookPageRemoveList, tmpPlatBookPageList, tmpRevisedBookPageList, tmpFloorBookPageList, tmpFloorRevisedBookPageList} = this.state;
            let tmpTitleBookPageList = [];
            tmpPlatBookPageList.forEach((tmpPlatBookPage) => {
                if (tmpPlatBookPage.page.length > 0 && tmpPlatBookPage.book.length > 0) {
                    tmpPlatBookPage.title = tmpTitle;
                    tmpTitleBookPageList.push(tmpPlatBookPage);
                } else if (tmpPlatBookPage.id != null)
                    bookPageRemoveList.push(tmpPlatBookPage);
            });

            tmpRevisedBookPageList.forEach((tmpRevisedBookPage) => {
                if (tmpRevisedBookPage.page.length > 0 && tmpRevisedBookPage.book.length > 0) {
                    tmpRevisedBookPage.title = tmpTitle;
                    tmpTitleBookPageList.push(tmpRevisedBookPage);
                } else if (tmpRevisedBookPage.id != null)
                    bookPageRemoveList.push(tmpRevisedBookPage);
            });

            tmpFloorBookPageList.forEach((tmpFloorBookPage) => {
                if (tmpFloorBookPage.page.length > 0 && tmpFloorBookPage.book.length > 0) {
                    tmpFloorBookPage.title = tmpTitle;
                    tmpTitleBookPageList.push(tmpFloorBookPage);
                } else if (tmpFloorBookPage.id != null)
                    bookPageRemoveList.push(tmpFloorBookPage);
            });

            tmpFloorRevisedBookPageList.forEach((tmpFloorRevisedBookPage) => {
                if (tmpFloorRevisedBookPage.page.length > 0 && tmpFloorRevisedBookPage.book.length > 0) {
                    tmpFloorRevisedBookPage.title = tmpTitle;
                    tmpTitleBookPageList.push(tmpFloorRevisedBookPage);
                } else if (tmpFloorRevisedBookPage.id != null)
                    bookPageRemoveList.push(tmpFloorRevisedBookPage);
            });

            if (bookPageRemoveList.length > 0)
                await this.manager.remove(TitleBookPage, bookPageRemoveList);

            if (tmpTitleBookPageList.length > 0)
                await this.manager.save(TitleBookPage, tmpTitleBookPageList);

            await this.syncService.syncItem(this.titleRepository,tmpTitle);
            await this.syncService.syncList(this.titleBookPageRepository,tmpTitleBookPageList,[tmpTitle]);

            this.setState((prevState) => {
                return {...prevState, saveFlag: 0}
            });

            if (this.state.showModal !== false) {
                this.setState({showModal: false})
            }

            const resetAction = StackActions.reset({
                index: 2,
                actions: [
                    StackActions.push({routeName: 'StartScreen'}),
                    StackActions.push({routeName: 'continueTitle'}),
                    StackActions.push({
                        routeName: 'BuildMyTitle',
                        params: {title: {...tmpTitle}, titleDetail: {...tmpTitleDetail}}
                    }),
                ],
            });
            this.props.navigation.dispatch(resetAction);
        }
    };

    setType = (searchType, isMaster) => {
        this.setState((prevState) => {
            return {
                ...prevState,
                showMaster: isMaster,
                tmpTitle: {...prevState.tmpTitle, type: searchType},
            };
        });
    };

    addTextInputPlatBookPage = () => {
        let tmpPlatBookPageList = this.state.tmpPlatBookPageList;
        tmpPlatBookPageList.push({book: '', page: '', withoutBookPageInfo: '', type: 'plat'});
        this.setState({tmpPlatBookPageList: tmpPlatBookPageList})
    };

    addTextInputRevisedBookPage = () => {
        let tmpRevisedBookPageList = this.state.tmpRevisedBookPageList;
        tmpRevisedBookPageList.push({book: '', page: '', withoutBookPageInfo: '', type: 'revised'});
        this.setState({tmpRevisedBookPageList: tmpRevisedBookPageList})
    };

    addTextInputFloorBookPage = () => {
        let tmpFloorBookPageList = this.state.tmpFloorBookPageList;
        tmpFloorBookPageList.push({book: '', page: '', withoutBookPageInfo: '', type: 'floor_plans'});
        this.setState({tmpFloorBookPageList: tmpFloorBookPageList})
    };

    addTextInputFloorRevisedBookPage = () => {
        let tmpFloorRevisedBookPageList = this.state.tmpFloorRevisedBookPageList;
        tmpFloorRevisedBookPageList.push({book: '', page: '', withoutBookPageInfo: '', type: 'revised_floor_plans'});
        this.setState({tmpFloorRevisedBookPageList: tmpFloorRevisedBookPageList})
    };

    removeTextPlatBookPage = (index) => {
        let {tmpPlatBookPageList, bookPageRemoveList} = this.state;
        if (tmpPlatBookPageList[index].id != null)
            bookPageRemoveList.push(tmpPlatBookPageList[index]);
        tmpPlatBookPageList.splice(index, 1);
        this.setState({tmpPlatBookPageList, bookPageRemoveList});
    };

    removeTextRevisedBookPage = (index) => {
        let {tmpRevisedBookPageList, bookPageRemoveList} = this.state;
        if (tmpRevisedBookPageList[index].id != null)
            bookPageRemoveList.push(tmpRevisedBookPageList[index]);
        tmpRevisedBookPageList.splice(index, 1);
        this.setState({tmpRevisedBookPageList, bookPageRemoveList});
    };

    removeTextFloorBookPage = (index) => {
        let {tmpFloorBookPageList, bookPageRemoveList} = this.state;
        if (tmpFloorBookPageList[index].id != null)
            bookPageRemoveList.push(tmpFloorBookPageList[index]);
        tmpFloorBookPageList.splice(index, 1);
        this.setState({tmpFloorBookPageList, bookPageRemoveList});
    };

    removeTextFloorRevisedBookPage = (index) => {
        let {tmpFloorRevisedBookPageList, bookPageRemoveList} = this.state;
        if (tmpFloorRevisedBookPageList[index].id != null)
            bookPageRemoveList.push(tmpFloorRevisedBookPageList[index]);
        tmpFloorRevisedBookPageList.splice(index, 1);
        this.setState({tmpFloorRevisedBookPageList, bookPageRemoveList});
    };

    clearSubdivisionCondominium() {

        let tmpTitle = this.state.tmpTitle;
        let tmpTitleDetail = this.state.tmpTitleDetail;


        if (tmpTitle.type === 'metes_and_bounds' && tmpTitleDetail.isOpenSection === false) {
            tmpTitle.township = null;
            tmpTitle.range = null;
            tmpTitle.condoName = null;
        }
        if (tmpTitle.type === 'metes_and_bounds' && tmpTitleDetail.isOpenSection === true) {
            tmpTitle.district = null;
            tmpTitle.landLot = null;
            tmpTitle.condoName = null;
        }

        tmpTitle.block = null;
        tmpTitleDetail.building = null;
        tmpTitle.pod = null;
        tmpTitle.phase = null;
        tmpTitle.subdivisionSection = null;
        tmpTitle.unit = null;
        tmpTitle.parking = null;
        tmpTitle.storage = null;
        tmpTitle.garage = null;
        tmpTitle.wine = null;
        tmpTitle.interestCommon = null;
        tmpTitleDetail.interestResidential = null;
        tmpTitle.zones = null;
        tmpTitle.lot = null;

        let tmpPlatList = [{
            book: '',
            page: '',
            withoutBookPageInfo: '',
            type: 'plat',
        }];
        let tmpRevisedList = [{
            book: '',
            page: '',
            withoutBookPageInfo: '',
            type: 'revised',
        }];
        let tmpFloorList = [{
            book: '',
            page: '',
            withoutBookPageInfo: '',
            type: 'floor_plans',
        }];
        let tmpFloorRevisedList = [{
            book: '',
            page: '',
            withoutBookPageInfo: '',
            type: 'revised_floor_plans',
        }];
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpPlatBookPageList: tmpPlatList,
                tmpRevisedBookPageList: tmpRevisedList,
                tmpFloorBookPageList: tmpFloorList,
                tmpFloorRevisedBookPageList: tmpFloorRevisedList
            }
        });

    }

    loadSearchType() {
        let tmpTitle = this.state.tmpTitle;
        if (tmpTitle.type === 'metes_and_bounds') {
            this.state.showMaster = false;
        } else {
            this.state.showMaster = true;
        }
    }

    formSubdivision({tmpTitleDetail, tmpTitle}) {

        return (

            <View>
                {this.state.showMaster ? (
                    <View>
                        <View style={styles.formRow}>
                            <TextInput
                                label='Lot/Condo Unit'
                                value={tmpTitle.lot}
                                style={styles.formControl}
                                onChangeText={(lot) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.lot = lot;
                                    this.setState(newState)
                                }}
                            />

                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='Block'
                                value={tmpTitle.block}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(block) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.block = block;
                                    this.setState(newState)
                                }}
                            />
                            <TextInput
                                label='Building'
                                value={tmpTitleDetail.building}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(building) => {
                                    let newState = {...this.state};
                                    newState.tmpTitleDetail.building = building;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='POD'
                                value={tmpTitle.pod}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(pod) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.pod = pod;
                                    this.setState(newState)
                                }}
                            />
                            <TextInput
                                label='Phase'
                                value={tmpTitle.phase}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(phase) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.phase = phase;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='Subdivision Section'
                                value={tmpTitle.subdivisionSection}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(subdivisionSection) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.subdivisionSection = subdivisionSection;
                                    this.setState(newState)
                                }}
                            />
                            <TextInput
                                label='Unit'
                                value={tmpTitle.unit}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(unit) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.unit = unit;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='Parking'
                                value={tmpTitle.parking}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(parking) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.parking = parking;
                                    this.setState(newState)
                                }}
                            />
                            <TextInput
                                label='Storage'
                                value={tmpTitle.storage}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(storage) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.storage = storage;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='Garage'
                                value={tmpTitle.garage}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(garage) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.garage = garage;
                                    this.setState(newState)
                                }}
                            />

                            <TextInput
                                label='Wine'
                                value={tmpTitle.wine}
                                style={[styles.formControl, {marginLeft: 5}]}
                                onChangeText={(wine) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.wine = wine;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='% Interest In Common Elements'
                                value={tmpTitle.interestCommon}
                                style={styles.formControl}
                                onChangeText={(interestCommon) => {
                                    let newState = {...this.state};
                                    newState.tmpTitle.interestCommon = interestCommon;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                        <View style={styles.formRow}>
                            <TextInput
                                label='% Interest In Residential Elements'
                                value={tmpTitleDetail.interestResidential}
                                style={styles.formControl}
                                onChangeText={(interestResidential) => {
                                    let newState = {...this.state};
                                    newState.tmpTitleDetail.interestResidential = interestResidential;
                                    this.setState(newState)
                                }}
                            />
                        </View>

                    </View>
                ) : null}

                <View style={styles.formRow}>
                    <TextInput
                        label='Tract'
                        value={tmpTitleDetail.tract}
                        style={[styles.formControl, {marginLeft: 5}]}
                        onChangeText={(tract) => {
                            let newState = {...this.state};
                            newState.tmpTitleDetail.tract = tract;
                            this.setState(newState)
                        }}
                    />
                    <TextInput
                        label='Acres'
                        value={tmpTitleDetail.acres}
                        style={[styles.formControl, {marginLeft: 5}]}
                        onChangeText={(acres) => {
                            let newState = {...this.state};
                            newState.tmpTitleDetail.acres = acres;
                            this.setState(newState)
                        }}
                    />
                </View>


            </View>
        )
    }

    showModalSave() {
        let {
            tmpTitle,
            tmpTitleDetail,
            tmpPlatBookPageList,
            tmpRevisedBookPageList,
            tmpFloorBookPageList,
            tmpFloorRevisedBookPageList,
            documentTitle,
            documentTitleDetail,
            documentPlat,
            documentRevised,
            documentFloor,
            documentFloorRevised
        } = this.state;

        if (documentTitle == null)
            documentTitle = tmpTitle;
        if (documentTitleDetail == null)
            documentTitleDetail = tmpTitleDetail;
        if (documentPlat == null)
            documentPlat = tmpPlatBookPageList;
        if (documentRevised == null)
            documentRevised = tmpRevisedBookPageList;
        if (documentFloor == null)
            documentFloor = tmpFloorBookPageList;
        if (documentFloorRevised == null)
            documentFloorRevised = tmpFloorRevisedBookPageList;

        if (JSON.stringify(documentTitle) !== JSON.stringify(tmpTitle) ||
            JSON.stringify(documentTitleDetail) !== JSON.stringify(tmpTitleDetail) ||
            JSON.stringify(documentPlat) !== JSON.stringify(tmpPlatBookPageList) ||
            JSON.stringify(documentRevised) !== JSON.stringify(tmpRevisedBookPageList) ||
            JSON.stringify(documentFloor) !== JSON.stringify(tmpFloorBookPageList) ||
            JSON.stringify(documentFloorRevised) !== JSON.stringify(tmpFloorRevisedBookPageList)
        ) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

    render() {
        let {tmpTitle} = this.state;
        let {tmpTitleDetail} = this.state;
        return (
            <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                  behavior={Platform.OS == "ios" ? "padding" : null}
                                  enabled={Platform.OS == "ios" ? true : false}
                                  keyboardVerticalOffset={Header.HEIGHT + 20}>
                <ScrollView contentContainerStyle={{flexGrow: 1}}
                            keyboardShouldPersistTaps="handled">
                    <View style={styles.containerFlat}>
                        <View style={stylesLegalDescriptionForm.textSwitchForm}>
                            <View>
                                <Text>
                                    Open Section | Township | Range
                                </Text>
                            </View>
                            <Switch
                                value={this.state.tmpTitleDetail.isOpenSection}
                                onValueChange={(value) => {
                                    this.setState((prevState) => {
                                        return {
                                            ...prevState,
                                            tmpTitleDetail: {
                                                ...prevState.tmpTitleDetail,
                                                isOpenSection: value
                                            }
                                        }
                                    });
                                }}
                            />
                        </View>

                        <Card style={styles.card}>
                            <Card.Content>
                                <Text>Property Type :</Text>
                                <View style={{flexDirection: "row", justifyContent: 'space-around'}}>
                                    <View style={stylesLegalDescriptionForm.radioButtonTextForm}>
                                        <TouchableRipple
                                            style={{alignItems: 'center'}}
                                            onPress={() => this.setType("subdivision", true)}
                                        >
                                            <View style={{alignItems: 'center'}}>
                                                <Text style={stylesLegalDescriptionForm.formLabel}>Subdivision</Text>
                                                <View pointerEvents="none">
                                                    <RadioButton
                                                        value="subdivision"
                                                        color={Colors.blue100}
                                                        status={(this.state.tmpTitle.type === "subdivision") ? 'checked' : 'unchecked'}
                                                    />
                                                </View>
                                            </View>
                                        </TouchableRipple>
                                    </View>
                                    <View style={stylesLegalDescriptionForm.radioButtonTextForm}>
                                        <TouchableRipple
                                            style={{alignItems: 'center'}}
                                            onPress={() => {
                                                this.setType("condominium", true)
                                            }}
                                        >
                                            <View style={{alignItems: 'center'}}>
                                                <Text style={stylesLegalDescriptionForm.formLabel}>Condominium</Text>
                                                <View pointerEvents="none">
                                                    <RadioButton
                                                        value="condominium"
                                                        color={Colors.blue100}
                                                        status={
                                                            this.state.tmpTitle.type === 'condominium' ? 'checked' : 'unchecked'
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </TouchableRipple>
                                    </View>
                                    <View style={{alignItems: 'center'}}>
                                        <TouchableRipple
                                            style={{alignItems: 'center'}}
                                            onPress={() => {
                                                this.state.showTractAcres = true;
                                                this.setType("metes_and_bounds", false)
                                            }}
                                        >
                                            <View style={{alignItems: 'center'}}>
                                                <Text style={stylesLegalDescriptionForm.formLabel}>Metes &
                                                    Bounds</Text>
                                                <Text style={stylesLegalDescriptionForm.formLabel}>(Long
                                                    Legal) </Text>
                                                <View pointerEvents="none">
                                                    <RadioButton
                                                        value="metes and bounds"
                                                        color={Colors.blue100}
                                                        status={
                                                            this.state.tmpTitle.type === 'metes_and_bounds' ? 'checked' : 'unchecked'
                                                        }
                                                    />
                                                </View>
                                            </View>
                                        </TouchableRipple>
                                    </View>

                                </View>
                                {this.state.showMaster ? (<View style={styles.formRow}>
                                    <TextInput
                                        label='Subdivision/Condo Name'
                                        value={tmpTitle.condoName}
                                        style={styles.formControl}
                                        onChangeText={(condoName) => {
                                            let newState = {...this.state};
                                            newState.tmpTitle.condoName = condoName;
                                            this.setState(newState)
                                        }}
                                    />
                                </View>) : null}

                            </Card.Content>
                        </Card>
                        <Card style={styles.card}>
                            <Card.Content>
                                {
                                    (this.state.tmpTitleDetail.isOpenSection) ?
                                        <View>
                                            <TextInput
                                                label='Section'
                                                value={tmpTitle.section ? String(tmpTitle.section) : null}
                                                style={styles.formControl}
                                                onChangeText={(section) => {
                                                    tmpTitle.section = section;
                                                    this.setState({tmpTitle: tmpTitle, edited: true});
                                                }}
                                            />
                                            <TextInput
                                                label='Township'
                                                value={tmpTitle.township ? String(tmpTitle.township) : null}
                                                style={styles.formControl}
                                                onChangeText={(township) => {
                                                    tmpTitle.township = township;
                                                    this.setState({tmpTitle: tmpTitle, edited: true});
                                                }}
                                            />
                                            <TextInput
                                                label='Range'
                                                value={tmpTitle.range ? String(tmpTitle.range) : null}
                                                style={styles.formControl}
                                                onChangeText={(range) => {
                                                    tmpTitle.range = range;
                                                    this.setState({tmpTitle: tmpTitle, edited: true});
                                                }}
                                            />
                                        </View>
                                        :
                                        <View>
                                            <TextInput
                                                label='District'
                                                value={tmpTitle.district ? String(tmpTitle.district) : null}
                                                style={styles.formControl}
                                                onChangeText={(district) => {
                                                    tmpTitle.district = district;
                                                    this.setState({tmpTitle: tmpTitle, edited: true});
                                                }}
                                            />
                                            <TextInput
                                                label='Land Lot'
                                                value={tmpTitle.landLot ? String(tmpTitle.landLot) : null}
                                                style={styles.formControl}
                                                onChangeText={(landLot) => {
                                                    tmpTitle.landLot = landLot;
                                                    this.setState({tmpTitle: tmpTitle, edited: true});
                                                }}
                                            />
                                            <TextInput
                                                label='Section'
                                                value={tmpTitle.section ? String(tmpTitle.section) : null}
                                                style={styles.formControl}
                                                onChangeText={(section) => {
                                                    tmpTitle.section = section;
                                                    this.setState({tmpTitle: tmpTitle, edited: true});
                                                }}
                                            />
                                        </View>
                                }
                            </Card.Content>
                        </Card>
                        {this.state.showMaster ? (
                            <View>
                                {
                                    (this.state.tmpTitleDetail.isOpenSection) ?
                                        <FormCheckBox title={tmpTitle}/>
                                        : null
                                }
                            </View>) : null}

                        <Card style={styles.card}>
                            <Card.Content>
                                {this.formSubdivision({tmpTitleDetail, tmpTitle})}

                            </Card.Content>
                        </Card>

                        {this.state.showMaster ? (
                            <View>

                                <Card style={styles.card}>
                                    <Card.Content>
                                        <View>
                                            <Text style={stylesLegalDescriptionForm.formText}>
                                                Plat Book + Page
                                            </Text>
                                        </View>
                                        {this.state.tmpPlatBookPageList.map((value, index) => {
                                            return <View style={styles.divideForm}>
                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label='Book'
                                                        value={this.state.tmpPlatBookPageList[index].book}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(book) => {
                                                            let tmpPlatBookPageList = this.state.tmpPlatBookPageList;
                                                            let tmpPlatBookPage = tmpPlatBookPageList[index];
                                                            tmpPlatBookPage.book = book;
                                                            tmpPlatBookPageList[index] = tmpPlatBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpPlatBookPageList: tmpPlatBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    <TextInput
                                                        label='Page'
                                                        value={this.state.tmpPlatBookPageList[index].page}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(page) => {
                                                            let tmpPlatBookPageList = this.state.tmpPlatBookPageList;
                                                            let tmpPlatBookPage = tmpPlatBookPageList[index];
                                                            tmpPlatBookPage.page = page;
                                                            tmpPlatBookPageList[index] = tmpPlatBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpPlatBookPageList: tmpPlatBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {
                                                        (index > 0) ?
                                                            <View style={stylesLegalDescriptionForm.iconView}>
                                                                <TouchableRipple
                                                                    onPress={() => this.removeTextPlatBookPage(index)}>
                                                                    <Icon name="remove-circle-outline" size={30}
                                                                          color="red"/>
                                                                </TouchableRipple>
                                                            </View>
                                                            : null
                                                    }

                                                </View>
                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label='Enter Plat without a Book and Page here'
                                                        value={this.state.tmpPlatBookPageList[index].withoutBookPageInfo}
                                                        style={[styles.formControl]}
                                                        onChangeText={(withoutBookPageInfo) => {
                                                            let tmpPlatBookPageList = this.state.tmpPlatBookPageList;
                                                            let tmpPlatBookPage = tmpPlatBookPageList[index];
                                                            tmpPlatBookPage.withoutBookPageInfo = withoutBookPageInfo;
                                                            tmpPlatBookPageList[index] = tmpPlatBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpPlatBookPageList: tmpPlatBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </View>
                                            </View>;
                                        })}

                                        <View style={[styles.formRow, {marginLeft: 10, marginTop: 10, width: '100%'}]}>
                                            <TouchableRipple
                                                onPress={() => this.addTextInputPlatBookPage(this.state.inputPlatBookPage.length)}>
                                                <View style={styles.formRow}>
                                                    <Icon name="add-circle-outline" size={30} color={'#6CC482'}/>

                                                    <Text style={stylesLegalDescriptionForm.formTextAddIcon}>
                                                        Add Plat Book + Page
                                                    </Text>
                                                </View>
                                            </TouchableRipple>
                                        </View>
                                    </Card.Content>
                                </Card>

                                <Card style={styles.card}>
                                    <Card.Content>

                                        <View>
                                            <Text style={stylesLegalDescriptionForm.formText}>
                                                Revised Plat at book + Page
                                            </Text>
                                        </View>
                                        {this.state.tmpRevisedBookPageList.map((value, index) => {
                                            return <View>
                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label='Book'
                                                        value={this.state.tmpRevisedBookPageList[index].book}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(book) => {
                                                            let tmpRevisedBookPageList = this.state.tmpRevisedBookPageList;
                                                            let tmpRevisedBookPage = tmpRevisedBookPageList[index];
                                                            tmpRevisedBookPage.book = book;
                                                            tmpRevisedBookPageList[index] = tmpRevisedBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpRevisedBookPageList: tmpRevisedBookPageList
                                                                }
                                                            });

                                                        }}
                                                    />
                                                    <TextInput
                                                        label='Page'
                                                        value={this.state.tmpRevisedBookPageList[index].page}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(page) => {
                                                            let tmpRevisedBookPageList = this.state.tmpRevisedBookPageList;
                                                            let tmpRevisedBookPage = tmpRevisedBookPageList[index];
                                                            tmpRevisedBookPage.page = page;
                                                            tmpRevisedBookPageList[index] = tmpRevisedBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpRevisedBookPageList: tmpRevisedBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {
                                                        (index > 0) ?
                                                            <View style={stylesLegalDescriptionForm.iconView}>
                                                                <TouchableRipple
                                                                    onPress={() => this.removeTextRevisedBookPage(index)}>
                                                                    <Icon name="remove-circle-outline" size={30}
                                                                          color="red"/>
                                                                </TouchableRipple>
                                                            </View>
                                                            : null
                                                    }
                                                </View>
                                                <View>
                                                    <TextInput
                                                        label='Enter Revised Plat without a Book and Page here'
                                                        value={this.state.tmpRevisedBookPageList[index].withoutBookPageInfo}
                                                        style={[styles.formControl]}
                                                        onChangeText={(withoutBookPageInfo) => {
                                                            let tmpRevisedBookPageList = this.state.tmpRevisedBookPageList;
                                                            let tmpRevisedBookPage = tmpRevisedBookPageList[index];
                                                            tmpRevisedBookPage.withoutBookPageInfo = withoutBookPageInfo;
                                                            tmpRevisedBookPageList[index] = tmpRevisedBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpRevisedBookPageList: tmpRevisedBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        })}
                                        <View style={[styles.formRow, {marginLeft: 10, marginTop: 10, width: '100%'}]}>
                                            <TouchableRipple
                                                onPress={() => this.addTextInputRevisedBookPage(this.state.inputPlatBookPage.length)}>
                                                <View style={styles.formRow}>
                                                    <Icon name="add-circle-outline" size={30} color={'#6CC482'}/>

                                                    <Text style={stylesLegalDescriptionForm.formTextAddIcon}>
                                                        Add Revised Plat Book + Page
                                                    </Text>
                                                </View>
                                            </TouchableRipple>
                                        </View>
                                    </Card.Content>
                                </Card>

                                <Card style={styles.card}>
                                    <Card.Content>

                                        <View>
                                            <Text style={stylesLegalDescriptionForm.formText}>
                                                Floor Plans Book + Page
                                            </Text>
                                        </View>
                                        {this.state.tmpFloorBookPageList.map((value, index) => {
                                            return <View>
                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label='Book'
                                                        value={this.state.tmpFloorBookPageList[index].book}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(book) => {
                                                            let tmpFloorBookPageList = this.state.tmpFloorBookPageList;
                                                            let tmpFloorBookPage = tmpFloorBookPageList[index];
                                                            tmpFloorBookPage.book = book;
                                                            tmpFloorBookPageList[index] = tmpFloorBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpFloorBookPageList: tmpFloorBookPageList
                                                                }
                                                            });

                                                        }}
                                                    />
                                                    <TextInput
                                                        label='Page'
                                                        value={this.state.tmpFloorBookPageList[index].page}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(page) => {
                                                            let tmpFloorBookPageList = this.state.tmpFloorBookPageList;
                                                            let tmpFloorBookPage = tmpFloorBookPageList[index];
                                                            tmpFloorBookPage.page = page;
                                                            tmpFloorBookPageList[index] = tmpFloorBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpFloorBookPageList: tmpFloorBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {
                                                        (index > 0) ?
                                                            <View style={stylesLegalDescriptionForm.iconView}>
                                                                <TouchableRipple
                                                                    onPress={() => this.removeTextFloorBookPage(index)}>
                                                                    <Icon name="remove-circle-outline" size={30}
                                                                          color="red"/>
                                                                </TouchableRipple>
                                                            </View>
                                                            : null
                                                    }
                                                </View>
                                                <View>
                                                    <TextInput
                                                        label='Enter Floor Plans without a Book and Page here:'
                                                        value={this.state.tmpFloorBookPageList[index].withoutBookPageInfo}
                                                        style={[styles.formControl]}
                                                        onChangeText={(withoutBookPageInfo) => {
                                                            let tmpFloorBookPageList = this.state.tmpFloorBookPageList;
                                                            let tmpFloorBookPage = tmpFloorBookPageList[index];
                                                            tmpFloorBookPage.withoutBookPageInfo = withoutBookPageInfo;
                                                            tmpFloorBookPageList[index] = tmpFloorBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpFloorBookPageList: tmpFloorBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        })}
                                        <View style={[styles.formRow, {marginLeft: 10, marginTop: 10, width: '100%'}]}>
                                            <TouchableRipple
                                                onPress={() => this.addTextInputFloorBookPage(this.state.inputPlatBookPage.length)}>
                                                <View style={styles.formRow}>
                                                    <Icon name="add-circle-outline" size={30} color={'#6CC482'}/>

                                                    <Text style={stylesLegalDescriptionForm.formTextAddIcon}>
                                                        Add Floor Plan Book + Page
                                                    </Text>
                                                </View>
                                            </TouchableRipple>
                                        </View>
                                    </Card.Content>
                                </Card>

                                <Card style={styles.card}>
                                    <Card.Content>
                                        <View>
                                            <Text style={stylesLegalDescriptionForm.formText}>
                                                Revised Floor Plans at Book + Page
                                            </Text>
                                        </View>
                                        {this.state.tmpFloorRevisedBookPageList.map((value, index) => {
                                            return <View>
                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label='Book'
                                                        value={this.state.tmpFloorRevisedBookPageList[index].book}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(book) => {
                                                            let tmpFloorRevisedBookPageList = this.state.tmpFloorRevisedBookPageList;
                                                            let tmpFloorRevisedBookPage = tmpFloorRevisedBookPageList[index];
                                                            tmpFloorRevisedBookPage.book = book;
                                                            tmpFloorRevisedBookPageList[index] = tmpFloorRevisedBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpFloorRevisedBookPageList: tmpFloorRevisedBookPageList
                                                                }
                                                            });

                                                        }}
                                                    />
                                                    <TextInput
                                                        label='Page'
                                                        value={this.state.tmpFloorRevisedBookPageList[index].page}
                                                        style={[styles.formControl, {marginLeft: 5}]}
                                                        onChangeText={(page) => {
                                                            let tmpFloorRevisedBookPageList = this.state.tmpFloorRevisedBookPageList;
                                                            let tmpFloorRevisedBookPage = tmpFloorRevisedBookPageList[index];
                                                            tmpFloorRevisedBookPage.page = page;
                                                            tmpFloorRevisedBookPageList[index] = tmpFloorRevisedBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpFloorRevisedBookPageList: tmpFloorRevisedBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                    {
                                                        (index > 0) ?
                                                            <View style={stylesLegalDescriptionForm.iconView}>
                                                                <TouchableRipple
                                                                    onPress={() => this.removeTextFloorRevisedBookPage(index)}>
                                                                    <Icon name="remove-circle-outline" size={30}
                                                                          color="red"/>
                                                                </TouchableRipple>
                                                            </View>
                                                            : null
                                                    }
                                                </View>
                                                <View>
                                                    <TextInput
                                                        label='Enter Revised Floor Plans without a Book and Page here'
                                                        value={this.state.tmpFloorRevisedBookPageList[index].withoutBookPageInfo}
                                                        style={[styles.formControl]}
                                                        onChangeText={(withoutBookPageInfo) => {
                                                            let tmpFloorRevisedBookPageList = this.state.tmpFloorRevisedBookPageList;
                                                            let tmpFloorRevisedBookPage = tmpFloorRevisedBookPageList[index];
                                                            tmpFloorRevisedBookPage.withoutBookPageInfo = withoutBookPageInfo;
                                                            tmpFloorRevisedBookPageList[index] = tmpFloorRevisedBookPage;
                                                            this.setState((prevState) => {
                                                                return {
                                                                    ...prevState,
                                                                    tmpFloorRevisedBookPageList: tmpFloorRevisedBookPageList
                                                                }
                                                            });
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                        })}
                                        <View style={[styles.formRow, {marginLeft: 10, marginTop: 10, width: '100%'}]}>
                                            <TouchableRipple
                                                onPress={() => this.addTextInputFloorRevisedBookPage(this.state.inputPlatBookPage.length)}>
                                                <View style={styles.formRow}>
                                                    <Icon name="add-circle-outline" size={30} color={'#6CC482'}/>

                                                    <Text style={stylesLegalDescriptionForm.formTextAddIcon}>
                                                        Add Revised Floor Plan Book + Page
                                                    </Text>
                                                </View>
                                            </TouchableRipple>
                                        </View>
                                    </Card.Content>
                                </Card>
                            </View>


                        ) :
                            <Card style={styles.card}>
                                <Card.Content>
                                    <TextInput
                                        style={styles.formControl}
                                        label='Metes and Bounds:'
                                        multiline={true}
                                        numberOfLines={4}
                                        value={tmpTitle.longLegal}
                                        onChangeText={(longLegal) => {
                                            let newState = {...this.state};
                                            newState.tmpTitle.longLegal = longLegal;
                                            this.setState(newState);
                                        }}
                                    >
                                    </TextInput>
                                </Card.Content>
                            </Card>
                        }

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
                            style={styles.screenButton}
                            mode="contained"
                            onPress={() => {
                                this.saveForm();
                            }}>
                            {this.state.saveFlag?'Saving...':'Continue'}
                        </Button>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        );
    }
}

const stylesLegalDescriptionForm = StyleSheet.create({

    formText: {
        color: '#006eaf',
        fontSize: 15,
        margin: 10
    },
    formTextAddIcon: {
        color: '#34A825',
        fontSize: 15,
        marginLeft: 10
    },
    iconView: {
        width: '10%',

    },
    containerFormIcon: {
        flexDirection: "row",
        margin: 10
    },
    ButtonForm: {
        marginTop: 16,
    },
    textSwitchForm: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 12,
        paddingHorizontal: 16,
    },
    radioButtonTextForm: {
        alignItems: 'center',
        paddingVertical: 20,
        justifyContent: 'space-between',

    },
    formLabel: {
        marginTop: 5,
        color: '#000'
    }

});

