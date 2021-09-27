import React, {Component} from "react";
import {
    ScrollView,
    Text,
    View,
    SafeAreaView,
    TouchableOpacity,
    StyleSheet,
    FlatList,
    KeyboardAvoidingView, Platform
} from "react-native";
import {Header} from "react-navigation-stack";
import {Button, Card, IconButton, TextInput, withTheme, Dialog, Portal} from "react-native-paper";
import RNPicker from "search-modal-picker";
import BookPageForm from "src/components/titleForm/BookPageForm";
import {styles, stylesRNPicker} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {DbImageRepository, PlatFloorPlanRepository} from 'src/repositories/index';
import {PlatFloorPlan, DeedType, DbImage} from 'src/entities/index';
import SyncService from 'src/services/SyncService';
import ModalSave from 'src/components/reusable/ModalSave';

const moment = require("moment");

class PlatFloorPlanForm extends Component {

    constructor(props) {
        super(props);

        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.dbImageRepository = getCustomRepository(DbImageRepository);
        this.platFloorPlanRepository = getCustomRepository(PlatFloorPlanRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let platFloorPlan = this.props.navigation.getParam('platFloorPlan', {});
        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpPlatFloorPlan: platFloorPlan,
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
            documentPlatFloorPlan: [],
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
        let tmpPlatFloorPlan = navigation.getParam('platFloorPlan');
        let deedType = navigation.getParam('deedType');
        let headerTitle = ((tmpPlatFloorPlan && tmpPlatFloorPlan.id) ? '' : 'Add ') + deedType.name;
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

    async init() {
        if (this.state.deedType.scope === 'master') {
            await  this.loadDeedList();
        } else {
            await this.loadMasterDocumentList();
        }
        await this.loadPlatFloorPlanImage();
        this.selectDeedType(this.state.deedType);
    };

    async saveForm() {
        let {saveFlag, tmpPlatFloorPlan, title, dbImageRemoveList} = this.state;

        if (tmpPlatFloorPlan.platBook !== null && typeof tmpPlatFloorPlan.platBook !== 'undefined') {
            tmpPlatFloorPlan.platBook = tmpPlatFloorPlan.platBook.toUpperCase();
        }
        if (tmpPlatFloorPlan.platPage !== null && typeof tmpPlatFloorPlan.platPage !== 'undefined') {
            tmpPlatFloorPlan.platPage = tmpPlatFloorPlan.platPage.toUpperCase();
        }

        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpPlatFloorPlan.dbImageList != null && tmpPlatFloorPlan.dbImageList.length > 0) {
                let pos = -1;
                tmpPlatFloorPlan.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpPlatFloorPlan.dbImageList);
            }

            tmpPlatFloorPlan.title = title;
            await this.platFloorPlanRepository.save(tmpPlatFloorPlan);

            if (dbImageRemoveList.length > 0) {
                await this.dbImageRepository.remove(dbImageRemoveList);
            }

            tmpPlatFloorPlan = await this.platFloorPlanRepository.findOne({
                where: {id: tmpPlatFloorPlan.id},
                relations: ['deedType', 'dbImageList', 'masterDocument', 'title']
            });

            if (!tmpPlatFloorPlan.apiId) {
                await this.syncService.syncItem(this.platFloorPlanRepository, tmpPlatFloorPlan, [title]);
            }

            if (tmpPlatFloorPlan.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpPlatFloorPlan.dbImageList, [tmpPlatFloorPlan]).then((dbImageList) => {
                    tmpPlatFloorPlan.dbImageList = dbImageList;
                    this.platFloorPlanRepository.save(tmpPlatFloorPlan);
                });
            }

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }
    };

    saveImages(dbImageList = []) {
        let {tmpPlatFloorPlan} = this.state;
        tmpPlatFloorPlan.dbImageList = dbImageList;
        this.setState({tmpPlatFloorPlan: tmpPlatFloorPlan, dbImageList: dbImageList});
    };

    showGallery() {
        let {dbImageList} = this.state.tmpPlatFloorPlan;
        if (typeof dbImageList === 'undefined' || dbImageList === null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'platFloorPlan',
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
        let masterDocList = await this.connection.getRepository(PlatFloorPlan)
            .createQueryBuilder("platFloorPlan")
            .leftJoinAndSelect("platFloorPlan.deedType", "deedType")
            .leftJoinAndSelect("platFloorPlan.title", "title")
            .where("deedType.scope = 'master' ")
            .andWhere("title.id = :titleId ", {titleId: this.state.title.id})
            .getMany();

        masterDocList.forEach((platFloorPlan) => {
            platFloorPlan.name = platFloorPlan.deedType.name + ' Bk: ' + platFloorPlan.platBook + ' Pg: ' + platFloorPlan.platPage;
        });

        this.setState({masterDocList: masterDocList});

        if (typeof this.state.tmpPlatFloorPlan.masterDocument !== 'undefined')
            this.selectMasterDocument(this.state.tmpPlatFloorPlan.masterDocument);

    };

    componentDidMount() {
        this.manager = getManager();
        this.init();
        this.openDialog();
    }

    selectDeedType(deedType) {
        let tmpPlatFloorPlan = this.state.tmpPlatFloorPlan;
        tmpPlatFloorPlan = {...tmpPlatFloorPlan, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpPlatFloorPlan: tmpPlatFloorPlan,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    selectMasterDocument(masterDocument) {
        let tmpPlatFloorPlan = this.state.tmpPlatFloorPlan;
        let masterName = masterDocument.deedType.name + ' B: ' + masterDocument.platBook + ' P: ' + masterDocument.platPage;
        tmpPlatFloorPlan = {...tmpPlatFloorPlan, masterDocument: masterDocument};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpPlatFloorPlan: tmpPlatFloorPlan,
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
        if (this.state.deedType.scope == 'secondary' && typeof this.state.tmpPlatFloorPlan.id == 'undefined') {
            this.setState({modal: true})
        }
    }

    async loadPlatFloorPlanImage() {
        if (!this.connection.isConnected)
            await  this.connection.connect();
        let tmpPlatFloorPlan = await this.manager.findOne(PlatFloorPlan, {
            where: {id: this.state.tmpPlatFloorPlan.id},
            relations: ['dbImageList', 'deedType', 'masterDocument', 'title']
        });

        if (tmpPlatFloorPlan != null) {
            tmpPlatFloorPlan.dbImageList.sort(function (a, b) {
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
            if (tmpPlatFloorPlan.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpPlatFloorPlan.dbImageList, [tmpPlatFloorPlan]).then((dbImageList) => {
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
                    tmpPlatFloorPlan.dbImageList = dbImageList;
                    this.platFloorPlanRepository.save(tmpPlatFloorPlan).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpPlatFloorPlan.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            tmpPlatFloorPlan: tmpPlatFloorPlan,
                            dbImageList: tmpPlatFloorPlan.dbImageList,
                            documentPlatFloorPlan: {...tmpPlatFloorPlan},
                            dbImageListCopy: dbImageListCopy
                        });
                    });
                });
            }
            let dbImageListCopy = JSON.stringify(tmpPlatFloorPlan.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                tmpPlatFloorPlan: tmpPlatFloorPlan,
                dbImageList: tmpPlatFloorPlan.dbImageList,
                documentPlatFloorPlan: {...tmpPlatFloorPlan},
                dbImageListCopy: dbImageListCopy
            });
        }
    }

    showModalSave() {
        let editDocument = this.state.documentPlatFloorPlan;
        let tmpPlatFloorPlan = this.state.tmpPlatFloorPlan;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpPlatFloorPlan) ||
            JSON.stringify(this.state.dbImageList) !== JSON.stringify(this.state.dbImageListCopy)
        ) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }


    }

    render() {
        const {masterDocList} = this.state;
        return (
            <SafeAreaView style={{flex: 1}}>
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
                                    {(this.state.deedType.scope == 'secondary') ?
                                        <View style={ styles.formRow }>

                                            <Text style={styles.formLabel}>
                                                Master Document
                                            </Text>
                                        </View>

                                        : null
                                    }
                                    {
                                        (this.state.deedType.scope == 'secondary') ?
                                            <View>
                                                {
                                                    ( typeof this.state.tmpPlatFloorPlan.id == 'undefined') ?
                                                        <SafeAreaView>
                                                            <Portal>
                                                                <Dialog
                                                                    style={stylesPlatFloorPlan.dialogFlat}
                                                                    visible={this.state.modal}
                                                                    dismissable={false}>
                                                                    <Dialog.Title
                                                                        style={{textAlign: 'center', fontSize: 16}}>Attach
                                                                        To:</Dialog.Title>
                                                                    <Dialog.ScrollArea>
                                                                        {
                                                                            (masterDocList.length > 0) ?
                                                                                <FlatList
                                                                                    style={{paddingTop: 10}}
                                                                                    keyExtractor={this.keyExtractor}
                                                                                    data={masterDocList}
                                                                                    renderItem={({item}) =>
                                                                                        <TouchableOpacity
                                                                                            onPress={() => {
                                                                                                this.selectMasterDocument(item);
                                                                                                this.setState({modal: false})
                                                                                            }}
                                                                                            style={[stylesPlatFloorPlan.card]}>

                                                                                            <Text
                                                                                                style={ stylesPlatFloorPlan.name }>
                                                                                                {item.deedType.name}:
                                                                                                Bk: {item.platBook}
                                                                                                Pg: {item.platPage}
                                                                                            </Text>

                                                                                        </TouchableOpacity>}
                                                                                /> :
                                                                                <View>
                                                                                    <Text style={{
                                                                                        marginVertical: 30,
                                                                                        textAlign: 'center',
                                                                                    }}>No Master Documents</Text>
                                                                                </View>
                                                                        }
                                                                        <View style={{marginTop: 100}}>
                                                                            <Button
                                                                                style={stylesPlatFloorPlan.button}
                                                                                color={Palette.light}
                                                                                mode="contained"
                                                                                onPress={() => {
                                                                                    this.closeDialog();
                                                                                }}>
                                                                                <Text
                                                                                    style={stylesPlatFloorPlan.textButton}>Cancel</Text></Button>
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
                                            : null
                                    }
                                    <View style={ styles.formRow }>
                                        <Text style={styles.formLabel}>
                                            {(this.state.deedType.scope === 'master') ? 'Plat' : 'Deed'} Book + Page
                                        </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <BookPageForm
                                            item={this.state.tmpPlatFloorPlan}
                                            bookName="platBook"
                                            pageName="platPage"
                                            onChange={item => {
                                                this.setState({tmpPlatFloorPlan: item})
                                            }}
                                            removeButton={ false }
                                            onImagePress={item => this.showGallery()}/>
                                    </View>

                                    <View style={ styles.formRow }>
                                        <Text style={styles.formLabel}>
                                            {(this.state.deedType.scope === 'master') ? 'Enter Plat without a Book and Page here:' : 'Enter Revised Plat without a Book and Page here:'}
                                        </Text>
                                    </View>
                                    <View style={[styles.formRow, {marginTop: -15}]}>
                                        <TextInput
                                            label=''
                                            style={styles.formControl}
                                            value={this.state.tmpPlatFloorPlan.withoutBookPageInfo ? String(this.state.tmpPlatFloorPlan.withoutBookPageInfo) : null}
                                            onChangeText={ (withoutBookPageInfo) => {
                                                let tmpPlatFloorPlan = {...this.state.tmpPlatFloorPlan};
                                                tmpPlatFloorPlan.withoutBookPageInfo = withoutBookPageInfo;
                                                this.setState({tmpPlatFloorPlan: tmpPlatFloorPlan});
                                            }}
                                        />
                                    </View>
                                    <Button
                                        icon="camera-outline"
                                        mode="contained"
                                        onPress={() => {
                                            this.showGallery();
                                        }}
                                        style={{marginVertical: 10}}>Add Page Images</Button>

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
                            {
                                (this.state.deedType.scope == 'master') ?
                                    <Card style={ styles.card }>
                                        <Card.Content>
                                            <TextInput
                                                multiline
                                                style={styles.formControl}
                                                label="Note"
                                                value={this.state.tmpPlatFloorPlan.note}
                                                onChangeText={ (note) => {
                                                    this.setState((prevState) => {
                                                        return {
                                                            ...prevState,
                                                            tmpPlatFloorPlan: {
                                                                ...prevState.tmpPlatFloorPlan,
                                                                note: note
                                                            }
                                                        }
                                                    });
                                                }}

                                            />

                                        </Card.Content>
                                    </Card>
                                    : null
                            }

                        </View>
                        <View style={styles.formBottomButton}>
                            <Button styles={styles.screenButton}
                                    mode="contained"
                                    onPress={() => this.saveForm()}>{this.state.saveFlag?'Saving...':(this.state.tmpPlatFloorPlan.id) ? 'Save Document' : 'Add Document to Title'}</Button>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}
export default withTheme(PlatFloorPlanForm);

const stylesPlatFloorPlan = StyleSheet.create({
    dialogFlat: {
        marginHorizontal: 0,
        backgroundColor: Palette.gray
    },
    name: {
        fontSize: 14,
        color: Palette.primary,
        textAlign: 'center',
        marginVertical: 5
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
});