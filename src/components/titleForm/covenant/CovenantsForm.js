import React, {Component} from "react";
import {
    ScrollView,
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView, Platform
} from "react-native";
import {NavigationEvents} from 'react-navigation';
import {Header} from "react-navigation-stack";
import {
    Button,
    Card,
    IconButton,
    withTheme,
    RadioButton,
    Divider,
    TouchableRipple
} from "react-native-paper";
import DatePicker from "react-native-datepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import BookPageForm from "src/components/titleForm/BookPageForm";
import {styles} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {CovenantRepository, DbImageRepository} from 'src/repositories/index';
import {Covenant, DeedType, DbImage} from 'src/entities/index';
import SyncService from 'src/services/SyncService';

const moment = require("moment");
const covenantTypeList = require('src/json/covenantTypeList');
import ModalSave from 'src/components/reusable/ModalSave';

class CovenantsForm extends Component {

    constructor(props) {
        super(props);

        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.covenantRepository = getCustomRepository(CovenantRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        this.state = {
            isShowGallery: true,
            title: {...tmpTitle},
            tmpCovenant: {
                hasConditions: false,
                isMandatoryAssociation: false,
                type: 'homeowners_association',
                dbImageList: []
            },
            type: 'deedImages',
            index: 0,
            value: true,
            saveFlag: 0,
            tmpRevisedList: [{
                deedBook: '',
                deedPage: '',
                dbImageList: [],
                title: [],
                deedType: [],
                masterDocument: []
            }],
            tmpRevisedRemoveList: [],
            documentCovenant: [],
            documentRevised: [],
            showModal: false,
            copyImageCovenant: [],
            copyImageRevised: [],
            imageRevised: [],
        };
        this.loadCovenant();
        this.saveForm = this.saveForm.bind(this);
        this.saveImages = this.saveImages.bind(this);
        this.props.navigation.setParams({saveForm: this.saveForm});
        this.showModalSave = this.showModalSave.bind(this);
        this.props.navigation.setParams({showModalSave: this.showModalSave});

    }

    static navigationOptions = ({navigation}) => {
        return {
            headerRight: (
                <IconButton
                    icon="check" color="white" size={25}
                    onPress={ navigation.getParam('saveForm') }
                />
            ),
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

    async loadCovenant() {
        if (!this.connection.isConnected)
            await this.connection.connect();
        let deedTypeCovenant = await this.manager.findOne(DeedType, {where: {code: 'covenant', docType: 'covenant'}});
        let tmpCovenant = await this.manager.findOne(Covenant, {
            where: {title: this.state.title, deedType: deedTypeCovenant},
            relations: ['dbImageList', 'deedType', 'masterDocument', 'title']
        });

        if (tmpCovenant != null) {
            tmpCovenant.dbImageList.sort(function (a, b) {
                if (a.position == null && b.position == null)
                    if (a.apiId == null && b.apiId == null)
                        return (a.id < b.id) ? -1 : 1;
                    else return (a.apiId < b.apiId) ? -1 : 1;
                if (a.position != null && b.position != null)
                    return (a.position < b.position) ? -1 : 1;
                if (a.position == null && b.position)
                    return 1;
                return -1;
            });
            if (tmpCovenant.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpCovenant.dbImageList, [tmpCovenant]).then((dbImageList) => {
                    dbImageList.sort(function (a, b) {
                        if (a.position == null && b.position == null)
                            if (a.apiId == null && b.apiId == null)
                                return (a.id < b.id) ? -1 : 1;
                            else return (a.apiId < b.apiId) ? -1 : 1;
                        if (a.position != null && b.position != null)
                            return (a.position < b.position) ? -1 : 1;
                        if (a.position == null && b.position)
                            return 1;
                        return -1;
                    });
                    tmpCovenant.dbImageList = dbImageList;
                    this.covenantRepository.save(tmpCovenant).then(() => {
                        let image = tmpCovenant.dbImageList;
                        this.setState({
                            tmpCovenant: tmpCovenant,
                            dbImageList: image,
                            documentCovenant: {...tmpCovenant},
                            copyImageCovenant: [...image]

                        })
                    });
                });
            }
        }

        if (tmpCovenant) {
            let image = tmpCovenant.dbImageList;
            this.setState({
                tmpCovenant: tmpCovenant,
                dbImageList: image,
                documentCovenant: {...tmpCovenant},
                copyImageCovenant: [...image]

            })
        }
        else {
            this.setState({documentCovenant: {...this.state.tmpCovenant}});
            tmpCovenant = {
                hasConditions: false,
                isMandatoryAssociation: false,
                dbImageList: []
            };
        }


        let deedTypeRevised = await this.manager.findOne(DeedType, {where: {code: 'revised', docType: 'covenant'}});
        let revisedList = await this.manager.find(Covenant, {
            where: {deedType: deedTypeRevised, title: this.state.title, masterDocument: tmpCovenant},
            relations: ['dbImageList', 'masterDocument', 'title', 'deedType']
        });
        if (tmpCovenant.apiId) {
            revisedList = await this.syncService.syncList(this.covenantRepository, revisedList, [this.state.title, tmpCovenant]);

            let totalRevisedItems = revisedList.length;
            let revisedImagesSyncCount = 0;
            revisedList.forEach((revised) => {
                revised.dbImageList.sort(function (a, b) {
                    if (a.position == null && b.position == null)
                        if (a.apiId == null && b.apiId == null)
                            return (a.id < b.id) ? -1 : 1;
                        else return (a.apiId < b.apiId) ? -1 : 1;
                    if (a.position != null && b.position != null)
                        return (a.position < b.position) ? -1 : 1;
                    if (a.position == null && b.position)
                        return 1;
                    return -1;
                });
                this.syncService.syncList(this.dbImageRepository, revised.dbImageList, [revised]).then((dbImageList) => {
                    dbImageList.sort(function (a, b) {
                        if (a.position == null && b.position == null)
                            if (a.apiId == null && b.apiId == null)
                                return (a.id < b.id) ? -1 : 1;
                            else return (a.apiId < b.apiId) ? -1 : 1;
                        if (a.position != null && b.position != null)
                            return (a.position < b.position) ? -1 : 1;
                        if (a.position == null && b.position)
                            return 1;
                        return -1;
                    });
                    revised.dbImageList = dbImageList;
                    revised.masterDocument = tmpCovenant;
                    this.covenantRepository.save(revised).then(() => {
                        revisedImagesSyncCount++;
                        // TODO: Extract in a separate funcion
                        if (revisedImagesSyncCount == totalRevisedItems) {
                            this.finishLoadCovenants(tmpCovenant, revisedList);
                        }
                    });
                });
            });
        }

        this.finishLoadCovenants(tmpCovenant, revisedList);
    }

    finishLoadCovenants(tmpCovenant, revisedList) {
        let revised = revisedList;
        let imageRevisedList = [];
        for (let imageListRevised of revisedList) {
            imageRevisedList = imageRevisedList.concat(imageListRevised.dbImageList)
        }

        if (revisedList == null || revisedList.length === 0) {

            revisedList = [{
                deedBook: '',
                deedPage: '',
                dbImageList: [],
                title: [],
                deedType: [],
                masterDocument: []
            }];
            revised = [{
                deedBook: '',
                deedPage: '',
                dbImageList: [],
                title: [],
                deedType: [],
                masterDocument: []
            }];

        }
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpRevisedList: revisedList,
                documentRevised: [...revised],
                copyImageRevised: [...imageRevisedList],
                imageRevised: [...imageRevisedList],
            }
        });
    }

    async saveForm() {
        let {saveFlag, tmpCovenant, tmpRevisedList, tmpRevisedRemoveList, title} = this.state;

        let deedTypeCovenant = await this.manager.findOne(DeedType, {where: {code: 'covenant', docType: 'covenant'}});
        let deedTypeRevised = await this.manager.findOne(DeedType, {where: {code: 'revised', docType: 'covenant'}});
        tmpCovenant.deedType = deedTypeCovenant;
        tmpCovenant.title = title;

        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (!tmpCovenant.hasConditions) {
                //delete covenant and relations
                for (let tmpRevised of tmpRevisedList) {
                    if (tmpRevised.id != null) {
                        await this.dbImageRepository.remove(tmpRevised.dbImageList);
                        await this.covenantRepository.remove(tmpRevised);
                    }
                }
                if (tmpCovenant.id) {
                    await this.dbImageRepository.remove(tmpCovenant.dbImageList);
                    await this.covenantRepository.remove(tmpCovenant);
                }
            } else {

                if (tmpCovenant.dbImageList == null)
                    tmpCovenant.dbImageList = [];
                if(tmpCovenant.dbImageList.length > 0){
                    let pos = -1;
                    tmpCovenant.dbImageList.forEach(dbImage => {
                        pos++;
                        dbImage.position = pos;
                    });
                }
                await this.dbImageRepository.save(tmpCovenant.dbImageList);
                await this.covenantRepository.save(tmpCovenant);

                await this.syncService.syncItem(this.covenantRepository, tmpCovenant, [title]);
                if (!tmpCovenant.dbImageList)
                    tmpCovenant.dbImageList = [];

                if (tmpCovenant.apiId)
                    this.syncService.syncList(this.dbImageRepository, tmpCovenant.dbImageList, [tmpCovenant]).then(dbImageList => {
                        tmpCovenant.dbImageList = dbImageList;
                        this.covenantRepository.save(tmpCovenant);
                    });

                if (tmpCovenant.id) {
                    for (let tmpRevised of tmpRevisedRemoveList) {
                        if (tmpRevised.id != null) {
                            await this.dbImageRepository.remove(tmpRevised.dbImageList);
                            await this.covenantRepository.remove(tmpRevised);
                        }
                    }

                    let tmpSecondaryDocumentList = [];
                    let tmpSecondaryDocDbImageList = [];
                    for (let tmpRevised of tmpRevisedList) {
                        if (tmpRevised.deedPage.trim().length > 0 && tmpRevised.deedBook.trim().length > 0) {
                            if (tmpRevised.dbImageList == null)
                                tmpRevised.dbImageList = [];
                            if(tmpRevised.dbImageList.length < 0){
                                let pos = -1;
                                tmpRevised.dbImageList.forEach(dbImage => {
                                    pos++;
                                    dbImage.position = pos;
                                });
                            }
                            await this.dbImageRepository.save(tmpRevised.dbImageList);
                            tmpRevised.title = title;
                            tmpRevised.masterDocument = tmpCovenant;
                            tmpRevised.deedType = deedTypeRevised;
                            tmpSecondaryDocumentList.push(tmpRevised);
                            tmpSecondaryDocDbImageList.push(tmpRevised.dbImageList);
                        }
                    }

                    await this.covenantRepository.save(tmpSecondaryDocumentList);
                    tmpSecondaryDocumentList = await this.syncService.syncList(this.covenantRepository, tmpSecondaryDocumentList, [title, tmpCovenant]);
                    tmpSecondaryDocumentList.forEach(async (secondaryDocument, index) => {
                        let tmpDbImageList = tmpSecondaryDocDbImageList[index];
                        if (tmpDbImageList && secondaryDocument.apiId)
                            this.syncService.syncList(this.dbImageRepository, tmpDbImageList, [secondaryDocument]).then((dbImageList) => {
                                secondaryDocument.dbImageList = dbImageList;
                                this.covenantRepository.save(secondaryDocument);
                            });
                    });
                }


            }

            this.setState((prevState) => {
                return {
                    ...prevState,
                    saveFlag: 0,
                    isShowGallery: false,
                }
            });

            if (!this.state.showModal) {
                this.props.navigation.navigate("DoubleCheck", {title: this.state.title});
            }
            else
                this.props.navigation.goBack();
            this.setState({showModal: false})

        }
    };

    saveImages(dbImageList) {
        let {tmpCovenant, tmpRevisedList, type} = this.state;
        if (type == 'deedImages') {
            tmpCovenant.dbImageList = dbImageList;
            this.setState({tmpCovenant: tmpCovenant});
        } else {
            let tmpRevised = tmpRevisedList[this.state.index];
            if (tmpRevised != null) {
                tmpRevised.dbImageList = dbImageList;
                tmpRevisedList[this.state.index] = tmpRevised;
                this.setState({tmpRevisedList: tmpRevisedList});
            }
        }
    };

    showGallery() {
        let {dbImageList} = this.state.tmpCovenant;
        if (dbImageList == null)
            dbImageList = [];
        this.setState({type: 'deedImages', isShowGallery: true});
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'covenant',
            saveImages: this.saveImages,
        });
    }

    showGalleryRevised(index) {
        let tmpRevisedList = this.state.tmpRevisedList;
        let revised = tmpRevisedList[index];
        let dbImageList = revised.dbImageList;
        this.setState({tmpRevisedList: tmpRevisedList, type: 'revised', index: index, isShowGallery: true});
        if (dbImageList == null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'covenant/revised',
            saveImages: this.saveImages,
        });
    }

    clearTypeConvenants(value) {
        let tmpCovenant = this.state.tmpCovenant;

        if (value === true) {
            this.setState((prevState) => {
                return {
                    ...prevState,
                    tmpCovenant: {
                        ...prevState.tmpCovenant,
                        isMandatoryAssociation: value
                    }
                }
            })
        }
        else {
            tmpCovenant.type = 'homeowners_association';
            this.setState((prevState) => {
                return {
                    ...prevState,
                    tmpCovenant: {
                        ...prevState.tmpCovenant,
                        isMandatoryAssociation: value
                    }
                }
            })

        }
    }

    addBookPageFormInput = () => {
        let tmpRevisedList = this.state.tmpRevisedList;
        tmpRevisedList.push({
            id: null,
            deedBook: '',
            deedPage: '',
            dbImageList: [],
            title: [],
            deedType: [],
            masterDocument: []
        });
        this.setState({tmpRevisedList});
    };

    removeBookPageFormInput = (index) => {
        let {tmpRevisedList, tmpRevisedRemoveList} = this.state;
        let tmpRevised = tmpRevisedList[index];
        if (tmpRevised != null && tmpRevised.id != null)
            tmpRevisedRemoveList.push(tmpRevised);
        tmpRevisedList.splice(index, 1);
        this.setState({tmpRevisedList, tmpRevisedRemoveList});
    };

    showModalSave() {
        let documentCovenant = this.state.documentCovenant;
        let tmpCovenant = this.state.tmpCovenant;
        let documentRevised = this.state.documentRevised;
        let tmpRevised = this.state.tmpRevisedList;
        let copyImageCovenant = this.state.copyImageCovenant;
        let dbImageList = this.state.tmpCovenant.dbImageList;
        let copyImageRevisedList = this.state.copyImageRevised;
        let imageRevised = [];

        for (let imageRevisedList of tmpRevised) {
            imageRevised = imageRevised.concat(imageRevisedList.dbImageList);
        }

        if (Object.entries(documentCovenant).toString() !== Object.entries(tmpCovenant).toString() ||
            Object.entries(documentRevised).toString() !== Object.entries(tmpRevised).toString() ||
            Object.entries(dbImageList).toString() !== Object.entries(copyImageCovenant).toString() ||
            Object.entries(imageRevised).toString() !== Object.entries(copyImageRevisedList).toString()
        ) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

    render() {

        return (
            <SafeAreaView style={{flex: 1}}>
                <NavigationEvents
                    onDidFocus={payload => {
                        if (!this.state.isShowGallery) {
                            this.loadCovenant();
                        }
                    }}
                />
                <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                      behavior={Platform.OS == "ios" ? "padding" : null}
                                      enabled={Platform.OS == "ios" ? true : false}
                                      keyboardVerticalOffset={Header.HEIGHT + 20}>
                    <ScrollView
                        contentContainerStyle={{flexGrow: 1, justifyContent: 'center', backgroundColor: Palette.gray}}
                        keyboardShouldPersistTaps="handled">

                        <View style={ styles.containerFlat }>
                            <Card style={ styles.card }>
                                <Card.Content>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <View style={[styles.formColumn, {flex: 2}]}>
                                            <Text>Are there any Covenants, Conditions or Restrictions of record?</Text>
                                        </View>
                                        <View style={[styles.formRow, {flex: 1}]}>
                                            <RadioButton.Group
                                                value={this.state.tmpCovenant.hasConditions}
                                                onValueChange={value => {
                                                    this.setState((prevState) => {
                                                        return {
                                                            ...prevState,
                                                            tmpCovenant: {
                                                                ...prevState.tmpCovenant,
                                                                hasConditions: value
                                                            },
                                                        }
                                                    });
                                                }}>
                                                <View style={styles.radioButtonColumn}>
                                                    <Text style={{flex: 1}}>Yes</Text>
                                                    <RadioButton value={true} color={Palette.primary}/>
                                                </View>
                                                <View style={styles.radioButtonColumn}>
                                                    <Text>No</Text>
                                                    <RadioButton value={false}
                                                                 status={!this.state.tmpCovenant.hasConditions ? 'checked' : 'unchecked'}
                                                                 color={Palette.primary}/>
                                                </View>
                                            </RadioButton.Group>
                                        </View>
                                    </View>

                                    {
                                        (this.state.tmpCovenant.hasConditions) ?
                                            <View>
                                                <View style={[styles.formRow, styles.divideForm]}>
                                                    <View style={[styles.formColumn, {flex: 2}]}>
                                                        <Text>Is this property subject to a Mandatory
                                                            Association?</Text>
                                                    </View>
                                                    <View style={[styles.formRow, {flex: 1}]}>
                                                        <RadioButton.Group
                                                            value={this.state.tmpCovenant.isMandatoryAssociation}
                                                            onValueChange={value => {
                                                                this.clearTypeConvenants(value);
                                                            }}>
                                                            <View style={styles.radioButtonColumn}>
                                                                <Text style={{flex: 1}}>Yes</Text>
                                                                <RadioButton value={true} color={Palette.primary}/>
                                                            </View>
                                                            <View style={styles.radioButtonColumn}>
                                                                <Text>No</Text>
                                                                <RadioButton value={false}
                                                                             status={!this.state.tmpCovenant.isMandatoryAssociation ? 'checked' : 'unchecked'}
                                                                             color={Palette.primary}/>
                                                            </View>
                                                        </RadioButton.Group>
                                                    </View>
                                                </View>

                                                {
                                                    (this.state.tmpCovenant.isMandatoryAssociation) ?
                                                        <View style={{marginLeft: 10}}>
                                                            <RadioButton.Group
                                                                value={this.state.tmpCovenant.type}
                                                                onValueChange={value => {
                                                                    this.setState((prevState) => {
                                                                        return {
                                                                            ...prevState,
                                                                            tmpCovenant: {
                                                                                ...prevState.tmpCovenant,
                                                                                type: value
                                                                            }
                                                                        }
                                                                    })
                                                                }}>
                                                                <View style={[styles.formRow, styles.divideForm]}>
                                                                    <Text style={{flex: 2}}>Homeowners
                                                                        Association</Text>
                                                                    <View style={[styles.radioButtonColumn, {flex: 1}]}>
                                                                        <RadioButton value="homeowners_association"
                                                                                     color={Palette.primary}
                                                                                     status={!this.state.tmpCovenant.type ? 'checked' : 'unchecked'}/>
                                                                    </View>
                                                                </View>
                                                                <Divider/>
                                                                <View style={[styles.formRow, styles.divideForm]}>
                                                                    <Text style={{flex: 2}}>Condominium Owners
                                                                        Association</Text>
                                                                    <View style={[styles.radioButtonColumn, {flex: 1}]}>
                                                                        <RadioButton
                                                                            value="condominium_owners_association"
                                                                            color={Palette.primary}/>
                                                                    </View>
                                                                </View>
                                                                <Divider/>
                                                            </RadioButton.Group>
                                                        </View>
                                                        : null
                                                }
                                                <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                                    <Text style={[styles.formLabel]}>
                                                        Instrument Date
                                                    </Text>
                                                </View>
                                                <DatePicker
                                                    style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                                    date={ this.state.tmpCovenant.instrumentDate }
                                                    mode="date"
                                                    placeholder=" "
                                                    format="YYYY-MM-DD"
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    iconComponent={
                                                        <Icon style={{position: 'absolute', right: 0, marginRight: 10}}
                                                              name="date-range"
                                                              size={25}
                                                              color="#757575"/>}
                                                    customStyles={ this.props.theme.formDatePicker }
                                                    onDateChange={(date) => {
                                                        let tmpCovenant = {...this.state.tmpCovenant};
                                                        tmpCovenant.instrumentDate = moment(date).format("YYYY/MM/DD");
                                                        this.setState({tmpCovenant: tmpCovenant});
                                                    }}
                                                />

                                                <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                                    <Text style={styles.formLabel}>
                                                        Date Recorded
                                                    </Text>
                                                </View>
                                                <DatePicker
                                                    style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                                    date={ this.state.tmpCovenant.dateRecorded }
                                                    mode="date"
                                                    placeholder=" "
                                                    format="YYYY-MM-DD"
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    iconComponent={
                                                        <Icon style={{position: 'absolute', right: 0, marginRight: 10}}
                                                              name="date-range"
                                                              size={25}
                                                              color="#757575"/>}
                                                    customStyles={ this.props.theme.formDatePicker }
                                                    onDateChange={(date) => {
                                                        let tmpCovenant = {...this.state.tmpCovenant};
                                                        tmpCovenant.dateRecorded = moment(date).format("YYYY/MM/DD");
                                                        this.setState({tmpCovenant: tmpCovenant});
                                                    }}
                                                />

                                            </View> : null
                                    }

                                </Card.Content>
                            </Card>

                            {
                                (this.state.tmpCovenant.hasConditions) ?
                                    <View>
                                        <Card style={ styles.card }>
                                            <Card.Content>
                                                <View style={ styles.formRow }>
                                                    <Text style={styles.formLabel}>
                                                        Deed Book + Page
                                                    </Text>
                                                </View>
                                                <View style={styles.formRow}>
                                                    <BookPageForm
                                                        item={this.state.tmpCovenant}
                                                        bookName="deedBook"
                                                        pageName="deedPage"
                                                        onChange={item => {
                                                            this.setState({tmpCovenant: item})
                                                        }}
                                                        removeButton={ false }
                                                        onImagePress={item => this.showGallery()}/>
                                                </View>
                                                <Button
                                                    icon="camera-outline"
                                                    mode="contained"
                                                    onPress={() => {
                                                        this.showGallery();
                                                    }}
                                                    style={{marginVertical: 10}}>Add Page Images</Button>
                                            </Card.Content>
                                        </Card>

                                        <Card style={ styles.card }>
                                            <Card.Content>
                                                <View style={ styles.formRow }>
                                                    <Text style={styles.formLabel}>Revised</Text>
                                                </View>
                                                {this.state.tmpRevisedList.map((value, index) => {
                                                    return <View>
                                                        <View style={[(index <= 0) ? {marginRight: 30} : null]}>
                                                            <View style={styles.formRow}>
                                                                <BookPageForm
                                                                    item={value}
                                                                    bookName="deedBook"
                                                                    pageName="deedPage"
                                                                    onChange={(item) => {
                                                                        value = item;
                                                                        let tmpRevisedList = this.state.tmpRevisedList;
                                                                        tmpRevisedList[index] = value;
                                                                        this.setState((prevState) => {
                                                                            return {
                                                                                ...prevState,
                                                                                tmpRevisedList: tmpRevisedList
                                                                            }
                                                                        })
                                                                    }}
                                                                    removeButton={(index > 0)}
                                                                    onRemove={item => this.removeBookPageFormInput(index)}
                                                                    onImagePress={item => this.showGalleryRevised(index)}/>
                                                            </View>
                                                        </View>
                                                        <Button
                                                            icon="camera-outline"
                                                            mode="contained"
                                                            onPress={() => {
                                                                this.showGalleryRevised(index)
                                                            }}
                                                            style={{marginVertical: 10}}>Add Images</Button>
                                                        <Divider/>

                                                    </View>;
                                                })}


                                                <View style={[styles.formRow, {
                                                    marginLeft: 10,
                                                    marginTop: 10,
                                                    width: '100%'
                                                }]}>
                                                    <TouchableRipple
                                                        onPress={() => this.addBookPageFormInput(this.state.inputRevisedBookPage)}>
                                                        <View style={styles.formRow}>
                                                            <Icon name="add-circle-outline" size={30}
                                                                  color={'#6CC482'}/>

                                                            <Text style={{
                                                                color: '#34A825',
                                                                fontSize: 15,
                                                                marginLeft: 10
                                                            }}>
                                                                Add Revision
                                                            </Text>
                                                        </View>
                                                    </TouchableRipple>
                                                </View>
                                            </Card.Content>
                                        </Card>
                                    </View> : null
                            }


                        </View>

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
                                    this.saveForm(true);
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
                        <View style={styles.formBottomButton}>
                            <Button style={styles.screenButton}
                                    mode="contained"
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : 'Continue'}</Button>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

export default withTheme(CovenantsForm);