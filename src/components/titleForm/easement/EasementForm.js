import React, {Component} from "react";
import {
    ScrollView,
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView, Platform,
    ImageBackground
} from "react-native";
import {Header} from "react-navigation-stack";
import {Button, Card, IconButton, TextInput, withTheme} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import DatePicker from "react-native-datepicker";
import RNPicker from "search-modal-picker";
import BookPageForm from "src/components/titleForm/BookPageForm";

import {styles, stylesRNPicker} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {EasementRepository, DbImageRepository} from 'src/repositories/index';

import {Easement, DeedType, DbImage} from 'src/entities/index';
import SyncService from 'src/services/SyncService';
import ModalSave from 'src/components/reusable/ModalSave';
const moment = require("moment");

import photoStarScreen from '../../../images/bg.jpg'

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

class EasementForm extends Component {

    constructor(props) {
        super(props);
        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.easementRepository = getCustomRepository(EasementRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let easement = this.props.navigation.getParam('easement', {});
        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpEasement: easement,
            labelSelected: deedType.name,
            labelMasterDocSelected: '',
            deedTypeList: [],
            dialogConfirmation: false,
            viewerVisible: false,
            viewerImages: [],
            saveFlag: 0,
            dbImageList: [],
            dbImageRemoveList: [],
            documentEasement: [],
            showModal: false,
            dbImageListCopy: []
        };

        this.saveForm = this.saveForm.bind(this);
        this.saveImages = this.saveImages.bind(this);
        this.removeImage = this.removeImage.bind(this);
        this.props.navigation.setParams({saveForm: this.saveForm});

        this.showModalSave = this.showModalSave.bind(this);
        this.props.navigation.setParams({showModalSave: this.showModalSave});

    }

    static navigationOptions = ({navigation}) => {
        let tmpEasement = navigation.getParam('easement');
        let headerTitle = ((tmpEasement && tmpEasement.id) ? '' : 'Add ') + 'Easement or Lease';
        return {
            headerRight: (
                <IconButton
                    icon="check" color="white" size={25}
                    onPress={ navigation.getParam('saveForm') }
                />
            ),
            headerTitle: headerTitle,
            headerLeft: (
                (Platform.OS == "ios") ?

                <TouchableOpacity onPress={navigation.getParam('showModalSave')}>
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
        }
    };

    async init() {
        await this.loadEasementList();
        await this.loadEasementImage();
        await this.selectDeedType(this.state.deedType);
    };

    async saveForm() {
        let {saveFlag, tmpEasement, dbImageRemoveList, title} = this.state;
        if (tmpEasement.deedBook !== null && typeof tmpEasement.deedBook !== 'undefined') {
            tmpEasement.deedBook = tmpEasement.deedBook.toUpperCase();
        }
        if (tmpEasement.deedPage !== null && typeof tmpEasement.deedPage !== 'undefined') {
            tmpEasement.deedPage = tmpEasement.deedPage.toUpperCase();
        }
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpEasement.dbImageList != null && tmpEasement.dbImageList.length > 0) {
                let pos = -1;
                tmpEasement.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpEasement.dbImageList);
            }

            tmpEasement.title = title;
            await this.easementRepository.save(tmpEasement);

            if (dbImageRemoveList.length > 0) {
                await this.dbImageRepository.remove(dbImageRemoveList);
            }

            tmpEasement = await this.easementRepository.findOne({
                where: {id: tmpEasement.id},
                relations: ['deedType', 'dbImageList', 'title']
            });

            if (!tmpEasement.apiId) {
                await this.syncService.syncItem(this.easementRepository, tmpEasement, [title]);
            }

            if (tmpEasement.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpEasement.dbImageList, [tmpEasement]).then((dbImageList) => {
                    tmpEasement.dbImageList = dbImageList;
                    this.easementRepository.save(tmpEasement);
                });
            }

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }

    };

    saveImages(dbImageList = []) {
        let {tmpEasement} = this.state;
        tmpEasement.dbImageList = dbImageList;
        this.setState({tmpEasement: tmpEasement, dbImageList: dbImageList});
    };

    showGallery() {
        let {dbImageList} = this.state.tmpEasement;
        if (typeof dbImageList === 'undefined' || dbImageList === null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'easement',
            saveImages: this.saveImages,
            removeImage: this.removeImage,
            imageListViewer: this.state.dbImageList
        });
    }

    removeImage(dbImage) {
        let dbRemoveImageList = this.state.dbImageRemoveList;
        dbRemoveImageList.push(dbImage);
        this.setState({dbImageRemoveList: dbRemoveImageList})
    }

    async loadEasementList() {
        if (!this.connection.isConnected)
            await  this.connection.connect();

        const {deedType} = this.state;
        let deedTypeList = await this.manager.find(DeedType, {docType: deedType.docType, scope: deedType.scope});

        this.setState({deedTypeList: deedTypeList});
    };

    componentDidMount() {
        this.manager = getManager();
        this.init();
    }

    selectDeedType(deedType) {
        let tmpEasement = this.state.tmpEasement;
        tmpEasement = {...tmpEasement, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpEasement: tmpEasement,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    async loadEasementImage() {
        if (!this.connection.isConnected)
            await  this.connection.connect();

        let tmpEasement = await this.manager.findOne(Easement, {
            where: {id: this.state.tmpEasement.id},
            relations: ['dbImageList', 'deedType', 'title']
        });

        if (tmpEasement) {
            tmpEasement.dbImageList.sort(function (a, b) {
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
            if (tmpEasement.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpEasement.dbImageList, [tmpEasement]).then((dbImageList) => {
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
                    tmpEasement.dbImageList = dbImageList;
                    this.easementRepository.save(tmpEasement).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpEasement.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            tmpEasement: tmpEasement,
                            dbImageList: tmpEasement.dbImageList,
                            documentEasement: {...tmpEasement},
                            dbImageListCopy: dbImageListCopy
                        });
                    });
                });
            }
            let dbImageListCopy = JSON.stringify(tmpEasement.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                tmpEasement: tmpEasement,
                dbImageList: tmpEasement.dbImageList,
                documentEasement: {...tmpEasement},
                dbImageListCopy: dbImageListCopy
            });
        }
    }

    showModalSave() {
        let editDocument = this.state.documentEasement;
        let tmpEasement = this.state.tmpEasement;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpEasement) ||
            JSON.stringify(this.state.dbImageList) !== JSON.stringify(this.state.dbImageListCopy)) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }


    };

    render() {
        return (
            <BackgroundImage style={{flex: 1}}>
                <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                      behavior={Platform.OS == "ios" ? "padding" : null}
                                      enabled={Platform.OS == "ios" ? true : false}
                                      keyboardVerticalOffset={Header.HEIGHT + 20}>
                    <ScrollView
                        contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                        keyboardShouldPersistTaps="handled">

                        <View style={ styles.containerFlat }>
                            <Card style={ styles.card }>
                                <Card.Content>

                                    <View style={ styles.formRow }>
                                        <Text style={styles.formLabel}>
                                            Deed Type:
                                        </Text>
                                    </View>

                                    <View>
                                        <View style={styles.formRow}>
                                            <RNPicker
                                                dataSource={this.state.deedTypeList}
                                                dummyDataSource={this.state.deedTypeList}
                                                defaultValue={true}
                                                pickerTitle={'Select a Deed Type'}
                                                showSearchBar={false}
                                                disablePicker={false}
                                                changeAnimation={"fade"}
                                                searchBarPlaceHolder={"Search....."}
                                                showPickerTitle={false}
                                                searchBarContainerStyle={this.props.searchBarContainerStyle}
                                                pickerStyle={stylesRNPicker.pickerStyle}
                                                pickerItemTextStyle={stylesRNPicker.listTextViewStyle}
                                                selectedLabel={this.state.labelSelected}
                                                placeHolderLabel='Select a Deed Type'
                                                selectLabelTextStyle={stylesRNPicker.selectLabelTextStyle}
                                                placeHolderTextStyle={stylesRNPicker.placeHolderTextStyle}
                                                dropDownImageStyle={stylesRNPicker.dropDownImageStyle}
                                                // dropDownImage={require("./res/ic_drop_down.png")}
                                                selectedValue={(index, item) => {
                                                    this.selectDeedType(item);
                                                }}
                                            />

                                        </View>

                                        <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                            <Text style={styles.formLabel}>
                                                Deed Date:
                                            </Text>
                                        </View>
                                        <DatePicker
                                            style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                            date={ this.state.tmpEasement.deedDate }
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
                                                let tmpEasement = {...this.state.tmpEasement};
                                                tmpEasement.deedDate = moment(date).format("YYYY/MM/DD");
                                                this.setState({tmpEasement: tmpEasement});
                                            }}
                                        />

                                        <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                            <Text style={styles.formLabel}>
                                                Date Recorded:
                                            </Text>
                                        </View>
                                        <DatePicker
                                            style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                            date={ this.state.tmpEasement.recDate}
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
                                                let tmpEasement = {...this.state.tmpEasement};
                                                tmpEasement.recDate = moment(date).format("YYYY/MM/DD");
                                                this.setState({tmpEasement: tmpEasement});
                                            }}
                                        />
                                        <View style={[styles.formRow, styles.divideForm]}>
                                            <Text style={styles.formLabel}>Grantor:</Text>
                                        </View>
                                      
                                        <View style={styles.formRow}>
                                            <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                <TextInput
                                                    label=""
                                                    backgroundColor="#fff"
                                                    mode= "flat"
                                                    underlineColor="none"
                                                    style={styles.formControl}
                                                    value={ this.state.tmpEasement.grantor }
                                                    onChangeText={ (grantor) => {
                                                        let tmpEasement = {...this.state.tmpEasement};
                                                        tmpEasement.grantor = grantor;
                                                        this.setState({tmpEasement: tmpEasement});
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
                                        </View>
                                                    
                                        <View style={[styles.formRow, styles.divideForm]}>
                                            <Text style={styles.formLabel}>Grantee:</Text>
                                        </View>
                                       
                                        <View style={styles.formRow}>
                                            <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                <TextInput
                                                    label=""
                                                    backgroundColor="#fff"
                                                    mode= "flat"
                                                    underlineColor="none"
                                                    style={styles.formControl}
                                                    value={ this.state.tmpEasement.grantee }
                                                    onChangeText={ (grantee) => {
                                                        let tmpEasement = {...this.state.tmpEasement};
                                                        tmpEasement.grantee = grantee;
                                                        this.setState({tmpEasement: tmpEasement});
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
                                        </View>
                                    </View>

                                    <View style={ [styles.formRow, {paddingTop: 10} ]}>
                                        <Text style={styles.formLabel}>
                                            Deed Book + Page:
                                        </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <BookPageForm
                                            item={this.state.tmpEasement}
                                            bookName="deedBook"
                                            pageName="deedPage"
                                            onChange={item => {
                                                this.setState({tmpEasement: item})
                                            }}
                                            removeButton={ false }
                                            onImagePress={item => this.showGallery()}/>
                                    </View>
                                    <Button
                                        icon="camera-outline"
                                        labelStyle={{fontWeight: 'bold'}}
                                        mode="contained"
                                        uppercase= {false}
                                        onPress={() => {
                                            this.showGallery();
                                        }}
                                        style={{marginVertical: 10,borderRadius: 12, borderWidth: 1, height: 50, justifyContent: 'center'}}>Add Page Images</Button>

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

                                </Card.Content>
                            </Card>

                        </View>
                        <View style={[styles.formBottomButton, {marginBottom: 25}]}>
                            <Button style={[styles.screenButton, {borderRadius: 12, borderWidth: 1, height: 50, justifyContent: 'center'}]}
                                    mode="contained"
                                    labelStyle={{fontWeight: 'bold'}}
                                    uppercase= {false}
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : (this.state.tmpEasement.id) ? 'Save Document' : 'Add Document to Title'}</Button>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </BackgroundImage>
        );
    }
}

export default withTheme(EasementForm);