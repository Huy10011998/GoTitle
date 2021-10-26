import React, {Component} from "react";
import {
    ScrollView,
    Text,
    View,
    SafeAreaView,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView, Platform,
    ImageBackground
} from "react-native";
import {Header} from "react-navigation-stack";
import {Button, Card, IconButton, TextInput, withTheme, Dialog, Portal} from "react-native-paper";
import RNPicker from "search-modal-picker";
import BookPageForm from "src/components/titleForm/BookPageForm";
import {styles, stylesRNPicker} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {LienRepository, DbImageRepository} from 'src/repositories/index';
import {Lien, DeedType} from 'src/entities/index';
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
            style={stylesLien.imageStartScreen}
            imageStyle={stylesLien.imageStartScreen2}
            >
                {this.props.children}
            </ImageBackground>
        )
    }
}

class LienForm extends Component {

    constructor(props) {
        super(props);

        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.lienRepository = getCustomRepository(LienRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let lien = this.props.navigation.getParam('lien', {});
        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpLien: lien,
            labelSelected: deedType.name,
            labelMasterDocSelected: '',
            deedTypeList: [],
            masterDocList: [],
            dialogConfirmation: false,
            viewerVisible: false,
            viewerImages: [],
            saveFlag: 0,
            modal: false,
            dbImageRemoveList: [],
            dbImageList: [],
            documentLien: [],
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
        let tmpLien = navigation.getParam('lien');
        let deedType = navigation.getParam('deedType');
        let headerTitle = ((tmpLien && tmpLien.id) ? '' : 'Add ') + ((deedType.scope == 'master') ? 'Lien' : deedType.name);
        return {
            headerRight: (
                (navigation.state.params.showGallery) ?
                    null
                    :
                    <IconButton
                        icon="check" color="white" size={25}
                        onPress={ navigation.getParam('saveForm') }
                    />
            ),
            headerTitle: headerTitle,
            headerLeft: (
                (Platform.OS == "ios") ?

                <TouchableOpacity  onPress={navigation.getParam('showModalSave')}>
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
        if (this.state.deedType.scope === 'master') {
            await  this.loadDeedList();
        } else {
            await this.loadMasterDocumentList();
        }
        await this.loadLienImage();

        this.selectDeedType(this.state.deedType);
    };

    async saveForm() {
        let {saveFlag, tmpLien, dbImageRemoveList, title} = this.state;
        if (tmpLien.book !== null && typeof tmpLien.book !== 'undefined') {
            tmpLien.book = tmpLien.book.toUpperCase();
        }
        if (tmpLien.page !== null && typeof tmpLien.page !== 'undefined') {
            tmpLien.page = tmpLien.page.toUpperCase();
        }
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpLien.dbImageList != null && tmpLien.dbImageList.length > 0) {
                let pos = -1;
                tmpLien.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpLien.dbImageList);
            }

            tmpLien.title = title;
            await this.lienRepository.save(tmpLien);

            if (dbImageRemoveList.length > 0) {
                await this.dbImageRepository.remove(dbImageRemoveList);
            }

            tmpLien = await this.lienRepository.findOne({
                where: {id: tmpLien.id},
                relations: ['deedType', 'dbImageList', 'masterDocument', 'title']
            });

            if (!tmpLien.apiId) {
                await this.syncService.syncItem(this.lienRepository, tmpLien, [title]);
            }

            if (tmpLien.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpLien.dbImageList, [tmpLien]).then((dbImageList) => {
                    tmpLien.dbImageList = dbImageList;
                    this.lienRepository.save(tmpLien);
                });
            }

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }
    };

    saveImages(dbImageList = []) {
        let {tmpLien} = this.state;
        tmpLien.dbImageList = dbImageList;
        this.setState({tmpLien: tmpLien, dbImageList: dbImageList});
    };

    showGallery() {
        let {dbImageList} = this.state.tmpLien;
        if (typeof dbImageList === 'undefined' || dbImageList === null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'lien',
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

    async loadDeedList() {
        if (!getConnection().isConnected)
            await  this.connection.connect();

        const {deedType} = this.state;
        let deedTypeList = await this.manager.find(DeedType, {docType: deedType.docType, scope: deedType.scope});

        this.setState({deedTypeList: deedTypeList});
    };

    async loadMasterDocumentList() {
        if (!getConnection().isConnected)
            await  this.connection.connect();
        let masterDocList = await this.connection.getRepository(Lien)
            .createQueryBuilder("lien")
            .leftJoinAndSelect("lien.deedType", "deedType")
            .leftJoinAndSelect("lien.title", "title")
            .where("deedType.scope = 'master' ")
            .andWhere("title.id = :titleId ", {titleId: this.state.title.id})
            .getMany();

        masterDocList.forEach((lien) => {
            lien.name = lien.deedType.name + ' Bk: ' + lien.book + ' Pg: ' + lien.page + '\nLienor: ' + lien.lienor + '       Debtor: ' + lien.debtor;
        });

        this.setState({masterDocList: masterDocList});
        if (typeof this.state.tmpLien.masterDocument !== 'undefined')
            this.selectMasterDocument(this.state.tmpLien.masterDocument);
    };

    componentDidMount() {
        this.manager = getManager();
        this.init();
        this.openDialog();

    }

    selectDeedType(deedType) {
        let tmpLien = this.state.tmpLien;
        tmpLien = {...tmpLien, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpLien: tmpLien,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    selectMasterDocument(masterDocument) {
        let tmpLien = this.state.tmpLien;
        let masterName = masterDocument.deedType.name + ' B: ' + masterDocument.book + ' P: ' + masterDocument.page;
        tmpLien = {...tmpLien, masterDocument: masterDocument};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpLien: tmpLien,
                labelMasterDocSelected: masterName
            }
        });
    };

    closeDialog() {
        this.setState({modal: false});
        this.props.navigation.goBack();
    }

    keyExtractor = (item, index) => String(item.id);

    openDialog() {
        if (this.state.deedType.scope == 'secondary' && typeof this.state.tmpLien.id == 'undefined') {
            this.setState({modal: true})
        }
    }

    async loadLienImage() {
        if (!this.connection.isConnected)
            await  this.connection.connect();
        let tmpLien = await this.manager.findOne(Lien, {
            where: {id: this.state.tmpLien.id},
            relations: ['dbImageList', 'deedType', 'masterDocument', 'title']
        });

        if (tmpLien != null) {
            tmpLien.dbImageList.sort(function (a, b) {
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
            if (tmpLien.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpLien.dbImageList, [tmpLien]).then((dbImageList) => {
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
                    tmpLien.dbImageList = dbImageList;
                    this.lienRepository.save(tmpLien).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpLien.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            tmpLien: tmpLien,
                            dbImageList: tmpLien.dbImageList,
                            documentLien: {...tmpLien},
                            dbImageListCopy: dbImageListCopy,
                        });
                    });
                });
            }
            let dbImageListCopy = JSON.stringify(tmpLien.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                tmpLien: tmpLien,
                dbImageList: tmpLien.dbImageList,
                documentLien: {...tmpLien},
                dbImageListCopy: dbImageListCopy,
            });
        }
    }

    showModalSave() {
        let editDocument = this.state.documentLien;
        let tmpLien = this.state.tmpLien;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpLien) ||
            JSON.stringify(this.state.dbImageList) !== JSON.stringify(this.state.dbImageListCopy)) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

    render() {
        const {masterDocList} = this.state;
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
                                        {
                                            (this.state.deedType && this.state.deedType.scope == 'master') ?
                                                <Text style={styles.formLabel}>
                                                    Lien Type:
                                                </Text>
                                                :
                                                <Text style={styles.formLabel}>
                                                    Master Document:
                                                </Text>
                                        }
                                    </View>

                                    {
                                        (this.state.deedType.scope == 'master') ?
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
                                                <View style={[styles.formRow, styles.divideForm]}>
                                                    <Text style={styles.formLabel}>Lienor / Plaintiff:</Text>
                                                </View>
                                               
                                                <View style={styles.formRow}>
                                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                        <TextInput
                                                            label=""
                                                            backgroundColor="#fff"      
                                                            mode= "flat"
                                                            underlineColor="none"
                                                            style={styles.formControl}
                                                            value={ this.state.tmpLien.lienor }
                                                            onChangeText={ (lienor) => {
                                                                let tmpLien = {...this.state.tmpLien};
                                                                tmpLien.lienor = lienor;
                                                                this.setState({tmpLien: tmpLien});
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
                                                    <Text style={styles.formLabel}>Debtor / Defendant:</Text>
                                                </View>
                                                
                                                <View style={styles.formRow}>
                                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                        <TextInput
                                                            label=""
                                                            backgroundColor="#fff"      
                                                            mode= "flat"
                                                            underlineColor="none"
                                                            style={styles.formControl}
                                                            value={ this.state.tmpLien.debtor }
                                                            onChangeText={ (debtor) => {
                                                                let tmpLien = {...this.state.tmpLien};
                                                                tmpLien.debtor = debtor;
                                                                this.setState({tmpLien: tmpLien});
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
                                                    <Text style={styles.formLabel}>Lien Amount $:</Text>
                                                </View>
                                               
                                                <View style={styles.formRow}>
                                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                        <TextInput
                                                            label=""
                                                            backgroundColor="#fff"      
                                                            mode= "flat"
                                                            underlineColor="none"
                                                            placeholder=""
                                                            style={styles.formControl}
                                                            keyboardType="numeric"
                                                            value={this.state.tmpLien.amount ? String(this.state.tmpLien.amount) : null}
                                                            onChangeText={ (amount) => {
                                                                let tmpLien = {...this.state.tmpLien};
                                                                tmpLien.amount = amount;
                                                                this.setState({tmpLien: tmpLien});
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
                                            : <View>
                                            {
                                                (this.state.deedType.scope == 'secondary' && typeof this.state.tmpLien.id == 'undefined') ?
                                                    <SafeAreaView>
                                                        <Portal>
                                                            <Dialog
                                                                style={stylesLien.dialogFlat}
                                                                visible={this.state.modal}
                                                                dismissable={false}>
                                                                <Dialog.Title
                                                                    style={{textAlign: 'center', fontSize: 16}}>Attach
                                                                    To:</Dialog.Title>
                                                                <Dialog.ScrollArea>
                                                                    {(masterDocList.length > 0) ?
                                                                        <FlatList
                                                                            style={{paddingTop: 2}}
                                                                            keyExtractor={this.keyExtractor}
                                                                            data={masterDocList}
                                                                            renderItem={({item}) =>
                                                                                <TouchableOpacity
                                                                                    onPress={() => {
                                                                                        this.selectMasterDocument(item);
                                                                                        this.setState({modal: false})
                                                                                    }}
                                                                                    style={[stylesLien.card]}>
                                                                                    <Text
                                                                                        style={ stylesLien.name }>
                                                                                        {item.deedType.name}:
                                                                                        Bk: {item.book}
                                                                                        Pg: {item.page} </Text>
                                                                                    <View style={{
                                                                                        flexDirection: 'row',
                                                                                        justifyContent: 'space-between',
                                                                                        marginHorizontal: 10
                                                                                    }}>
                                                                                        <Text
                                                                                            style={[stylesLien.name, {flex: 1}]}
                                                                                            numberOfLines={1}>Lienor: {item.lienor} </Text>
                                                                                        <Text
                                                                                            style={[stylesLien.name, {flex: 1}]}
                                                                                            numberOfLines={1}>Debtor: {item.debtor}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            }
                                                                        /> : <View>
                                                                            <Text style={{
                                                                                marginVertical: 30,
                                                                                textAlign: 'center',
                                                                            }}>No Master Documents</Text>
                                                                        </View>}

                                                                    <View style={{marginTop: 100}}>
                                                                        <Button
                                                                            labelStyle={{fontWeight: 'bold'}}
                                                                            style={stylesLien.button}
                                                                            color={Palette.light}
                                                                            mode="contained"
                                                                            onPress={() => {
                                                                                this.closeDialog();
                                                                            }}>
                                                                            <Text
                                                                                style={stylesLien.textButton}>Cancel</Text></Button>
                                                                    </View>
                                                                </Dialog.ScrollArea>
                                                            </Dialog>
                                                        </Portal>
                                                    </SafeAreaView>
                                                    : null
                                            }
                                            <View style={styles.formRow}>
                                                <RNPicker
                                                    dataSource={this.state.masterDocList}
                                                    dummyDataSource={this.state.masterDocList}
                                                    defaultValue={true}
                                                    pickerTitle={'Attach to:'}
                                                    showSearchBar={false}
                                                    disablePicker={false}
                                                    changeAnimation={"fade"}
                                                    searchBarPlaceHolder={"Search....."}
                                                    showPickerTitle={true}
                                                    searchBarContainerStyle={this.props.searchBarContainerStyle}
                                                    pickerStyle={stylesRNPicker.pickerStyle}
                                                    pickerItemTextStyle={stylesRNPicker.listTextViewStyle}
                                                    selectedLabel={this.state.labelMasterDocSelected}
                                                    placeHolderLabel='Select a Master Document'
                                                    selectLabelTextStyle={stylesRNPicker.selectLabelTextStyle}
                                                    placeHolderTextStyle={stylesRNPicker.placeHolderTextStyle}
                                                    dropDownImageStyle={stylesRNPicker.dropDownImageStyle}
                                                    // dropDownImage={require("./res/ic_drop_down.png")}
                                                    selectedValue={(index, item) => {
                                                        this.selectMasterDocument(item);
                                                    }}
                                                />
                                            </View>
                                        </View>
                                    }
                                    {
                                        (this.state.deedType.code == 'assignment_transferred') ?
                                            <View style={styles.formRow}>
                                                <TextInput
                                                    label="Assigned / Transferred to"
                                                    style={styles.formControl}
                                                    value={this.state.tmpLien.assignedTransferred ? String(this.state.tmpLien.assignedTransferred) : null}
                                                    onChangeText={ (assignedTransferred) => {
                                                        let tmpLien = {...this.state.tmpLien};
                                                        tmpLien.assignedTransferred = assignedTransferred;
                                                        this.setState({tmpLien: tmpLien});
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
                                            : null
                                    }

                                    <View style={ styles.formRow }>
                                        <Text style={[styles.formLabel, {paddingTop: 10}]}>
                                            Lien Book + Page:
                                        </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <BookPageForm
                                            item={this.state.tmpLien}
                                            bookName="book"
                                            pageName="page"
                                            onChange={item => {
                                                this.setState({tmpLien: item})
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
                                    onPress={() => this.saveForm()}>{this.state.saveFlag?'Saving...':(this.state.tmpLien.id) ? 'Save Document' : 'Add Document to Title'}</Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </BackgroundImage>
        );
    }
}
export default withTheme(LienForm);

const stylesLien = StyleSheet.create({
    dialogFlat: {
        marginHorizontal: 0,
        backgroundColor: Palette.gray
    },
    name: {
        fontSize: 14,
        color: Palette.primary,
        textAlign: 'center',
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

        marginVertical: 1,
        backgroundColor: Palette.light,
        padding: 0,
        marginHorizontal: 0,
    },
    button: {
        borderRadius: 10,
        marginVertical: 10
    },
    textButton: {
        color: Palette.primary,
        fontSize: 16
    },
    sectionName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        color: Palette.primary,
        textAlign: 'center'
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    }
});
