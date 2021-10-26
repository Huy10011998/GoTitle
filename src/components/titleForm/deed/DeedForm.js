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
import {Button, Card, IconButton, TextInput, withTheme, Switch, Divider} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import DatePicker from "react-native-datepicker";
import RNPicker from "search-modal-picker";
import BookPageForm from "src/components/titleForm/BookPageForm";
import ModalSave from 'src/components/reusable/ModalSave';

import {styles, stylesRNPicker} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {DeedRepository, DbImageRepository} from 'src/repositories/index';
import {Deed, DeedType, Title, DbImage} from 'src/entities/index';
import SyncService from "src/services/SyncService";

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

class DeedForm extends Component {

    constructor(props) {
        super(props);

        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.deedRepository = getCustomRepository(DeedRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let deed = this.props.navigation.getParam('deed', {});

        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpDeed: deed,
            labelSelected: deedType.name,
            labelMasterDocSelected: '',
            deedTypeList: [],
            dialogConfirmation: false,
            viewerVisible: false,
            viewerImages: [],
            saveFlag: 0,
            currentOwnerDeed: false,
            dbImageRemoveList: [],
            dbImageList: [],
            documentDeed: {...deed},
            showModal: false,
            copyCurrentOwnerDeed: false,
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
        let tmpDeed = navigation.getParam('deed');
        let headerTitle = ((tmpDeed && tmpDeed.id) ? '' : 'Add ') + ' Chain of Title';
        return {
            headerRight: (
                <IconButton
                    icon="check" color="white" size={25}
                    onPress={navigation.getParam('saveForm')}
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
        await this.loadDeedList();
        await this.loadDeedImage();
        this.selectDeedType(this.state.deedType);
    };

    sortDbImageList(dbImageList=[]){
        return dbImageList;
    }
    async loadDeedImage() {
        if (!this.connection.isConnected)
            await this.connection.connect();
        let tmpDeed = await this.manager.findOne(Deed, {
            where: {id: this.state.tmpDeed.id},
            relations: ['deedType', 'dbImageList', 'title']
        });

        let existCurrentOwner = await this.existCurrentOwner();
        if (tmpDeed != null) {
            if (!existCurrentOwner)
                tmpDeed.currentOwner = true;
            if (tmpDeed.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpDeed.dbImageList, [tmpDeed]).then((dbImageList) => {
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
                    tmpDeed.dbImageList = dbImageList;
                    this.deedRepository.save(tmpDeed).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpDeed.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            documentDeed: {...tmpDeed},
                            tmpDeed: tmpDeed,
                            documentDeed: {...tmpDeed},
                            dbImageList: tmpDeed.dbImageList,
                            dbImageListCopy: dbImageListCopy
                        })
                    });
                });
            }

            tmpDeed.dbImageList.sort(function (a, b) {
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
            let dbImageListCopy = JSON.stringify(tmpDeed.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                documentDeed: {...tmpDeed},
                tmpDeed: tmpDeed,
                documentDeed: {...tmpDeed},
                dbImageList: tmpDeed.dbImageList,
                dbImageListCopy: dbImageListCopy
            })
        } else {
            this.setState({tmpDeed: {currentOwner: !existCurrentOwner}});
        }
    }

    async existCurrentOwner() {
        let deedList = await this.deedRepository.find({title: {id: this.state.title.id}});

        let existCO = false;
        deedList.forEach((deed) => {
            if (deed.currentOwner) {
                existCO = true;
                return;
            }
        });
        return existCO;
    }

    async setDefaultCurrentOwner() {
        let existCurrenOwner = await this.existCurrentOwner();
        if (!existCurrenOwner) {
            let defaultDeed = await this.deedRepository.findOne({
                title: {id: this.state.title.id},
                relations: ['deedType', 'title', 'dbImageList']
            });
            if (defaultDeed != null) {
                defaultDeed.currentOwner = true;
                await this.deedRepository.save(defaultDeed);
            }
        }
    }

    async saveForm() {
        let {saveFlag, tmpDeed, title, dbImageRemoveList} = this.state;
        if (tmpDeed.deedBook != null) {
            tmpDeed.deedBook = tmpDeed.deedBook.toUpperCase();
        }
        if (tmpDeed.deedPage != null) {
            tmpDeed.deedPage = tmpDeed.deedPage.toUpperCase();
        }
        if (saveFlag == 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });

            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpDeed.dbImageList != null && tmpDeed.dbImageList.length > 0) {
                let pos = -1;
                tmpDeed.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpDeed.dbImageList);
            }

            tmpDeed.title = this.state.title;
            await this.deedRepository.save(tmpDeed);

            if (dbImageRemoveList.length > 0) {
                await this.manager.remove(DbImage, dbImageRemoveList);
            }

            tmpDeed = await this.deedRepository.findOne({
                where: {id: tmpDeed.id},
                relations: ['deedType', 'dbImageList', 'title']
            });

            if (!tmpDeed.apiId) {
                await this.syncService.syncItem(this.deedRepository, tmpDeed, [title]);
            }

            if (tmpDeed.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpDeed.dbImageList, [tmpDeed]).then((dbImageList) => {
                    tmpDeed.dbImageList = dbImageList;
                    this.deedRepository.save(tmpDeed);
                });
            }

            await this.setDefaultCurrentOwner();

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }
    };

    saveImages(dbImageList = []) {
        let {tmpDeed} = this.state;
        tmpDeed.dbImageList = dbImageList;
        this.setState({tmpDeed: tmpDeed, dbImageList: dbImageList});
    }

    showGallery() {
        let {dbImageList} = this.state.tmpDeed;

        if (dbImageList == null)
            dbImageList = [];

        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'deed',
            saveImages: this.saveImages,
            removeImage: this.removeImage,
            imageListViewer: this.state.dbImageList
        });
    }

    removeImage(dbImage) {
        let {dbImageRemoveList} = this.state;
        dbImageRemoveList.push(dbImage);
        this.setState({dbImageRemoveList: dbImageRemoveList})
    }

    async loadDeedList() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        const {deedType} = this.state;
        let deedTypeList = await this.manager.find(DeedType, {docType: deedType.docType, scope: deedType.scope});

        this.setState({deedTypeList: deedTypeList});

    };

    componentDidMount() {
        this.manager = getManager();
        this.init();
    }

    selectDeedType(deedType) {
        let tmpDeed = this.state.tmpDeed;
        tmpDeed = {...tmpDeed, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpDeed: tmpDeed,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    showModalSave() {
        let editDocument = this.state.documentDeed;
        let tmpDeed = this.state.tmpDeed;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpDeed) ||
            this.state.currentOwnerDeed !== this.state.copyCurrentOwnerDeed ||
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

                        <View style={styles.containerFlat}>
                            <Card style={styles.card}>
                                <Card.Content>

                                    <View style={styles.formRow}>
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
                                                    pickerTitle={'Select Deed Type'}
                                                    showSearchBar={false}
                                                    disablePicker={false}
                                                    changeAnimation={"fade"}
                                                    searchBarPlaceHolder={"Search....."}
                                                    showPickerTitle={false}
                                                    searchBarContainerStyle={this.props.searchBarContainerStyle}
                                                    pickerStyle={stylesRNPicker.pickerStyle}
                                                    pickerItemTextStyle={stylesRNPicker.listTextViewStyle}
                                                    selectedLabel={this.state.labelSelected}
                                                    placeHolderLabel='Select Deed Type'
                                                    selectLabelTextStyle={stylesRNPicker.selectLabelTextStyle}
                                                    placeHolderTextStyle={stylesRNPicker.placeHolderTextStyle}
                                                    dropDownImageStyle={stylesRNPicker.dropDownImageStyle}
                                                    // dropDownImage={require("./res/ic_drop_down.png")}
                                                    selectedValue={(index, item) => {
                                                        this.selectDeedType(item);
                                                    }}
                                                />
                                        </View>
                                        <View>
                                            <View style={{
                                                flexDirection: 'row',
                                                justifyContent: 'space-between',
                                                marginVertical: 15
                                            }}>
                                                <Text style={styles.formLabel}>
                                                    Current Owner
                                                </Text>
                                                <Switch
                                                    value={this.state.tmpDeed.currentOwner}
                                                    onValueChange={(value) => {
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                tmpDeed: {
                                                                    ...prevState.tmpDeed,
                                                                    currentOwner: value
                                                                }
                                                            }
                                                        });
                                                    }}
                                                />

                                            </View>
                                        </View>
                                        <Divider/>

                                        <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                            <Text style={styles.formLabel}>
                                                Deed Date:
                                            </Text>
                                        </View>
                                        <DatePicker
                                            style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                            date={this.state.tmpDeed.deedDate}
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
                                            customStyles={this.props.theme.formDatePicker}
                                            onDateChange={(date) => {
                                                let tmpDeed = {...this.state.tmpDeed};
                                                tmpDeed.deedDate = moment(date).format("YYYY/MM/DD");
                                                this.setState({tmpDeed: tmpDeed});
                                            }}
                                        />

                                        <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                            <Text style={styles.formLabel}>
                                                Date Recorded:
                                            </Text>
                                        </View>
                                        <DatePicker
                                            style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                            date={ this.state.tmpDeed.recDate}
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
                                            customStyles={this.props.theme.formDatePicker}
                                            onDateChange={(date) => {
                                                let tmpDeed = {...this.state.tmpDeed};
                                                tmpDeed.recDate = moment(date).format("YYYY/MM/DD");
                                                this.setState({tmpDeed: tmpDeed});
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
                                                    value={this.state.tmpDeed.grantor}
                                                    onChangeText={(grantor) => {
                                                        let tmpDeed = {...this.state.tmpDeed};
                                                        tmpDeed.grantor = grantor;
                                                        this.setState({tmpDeed: tmpDeed});
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
                                                    value={this.state.tmpDeed.grantee}
                                                    onChangeText={(grantee) => {
                                                        let tmpDeed = {...this.state.tmpDeed};
                                                        tmpDeed.grantee = grantee;
                                                        this.setState({tmpDeed: tmpDeed});
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

                                    <View style={[styles.formRow, {paddingTop: 10}]}>
                                        <Text style={styles.formLabel}>
                                            Deed Book + Page:
                                        </Text>
                                    </View>
                                    
                                        <View style={styles.formRow}>
                                            <BookPageForm
                                                item={this.state.tmpDeed}
                                                bookName="deedBook"
                                                pageName="deedPage"
                                                onChange={item => {
                                                    this.setState({tmpDeed: item})
                                                }}
                                                removeButton={false}
                                                onImagePress={item => this.showGallery()}/>
                                        </View>
            
                                    <Button
                                        labelStyle={{fontWeight: 'bold'}}
                                        icon="camera-outline"
                                        mode="contained"
                                        uppercase= {false}
                                        onPress={() => {
                                            this.showGallery();
                                        }}
                                        style={{marginVertical: 10, borderRadius: 12, borderWidth: 1, height: 50, justifyContent: 'center'}}>Add Page Images</Button>

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
                            <Button style={styles.screenButton}
                                    mode="contained"
                                    labelStyle={{fontWeight: 'bold'}}
                                    uppercase= {false}
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : ((this.state.tmpDeed.id) ? 'Save Document' : 'Add Document to Title')}</Button>
                        </View>


                    </ScrollView>
                </KeyboardAvoidingView>
            </BackgroundImage>
        );
    }
}

export default withTheme(DeedForm);