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
import DatePicker from "react-native-datepicker";
import Icon from "react-native-vector-icons/MaterialIcons";
import RNPicker from "search-modal-picker";
import BookPageForm from "src/components/titleForm/BookPageForm";
import {styles, stylesRNPicker} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {DbImageRepository, MortgageRepository, DeedTypeRepository} from 'src/repositories/index';
import {Mortgage, DeedType, DbImage} from 'src/entities/index';
import SyncService from 'src/services/SyncService';
import ModalSave from 'src/components/reusable/ModalSave';

const moment = require("moment");

class MortgageForm extends Component {

    constructor(props) {
        super(props);

        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.mortgageRepository = getCustomRepository(MortgageRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);
        this.manager = getManager();
        this.connection = getConnection();

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let mortgage = this.props.navigation.getParam('mortgage', {});

        this.syncService = new SyncService();
        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpMortgage: mortgage,
            labelSelected: deedType.name,
            labelMasterDocSelected: '',
            deedTypeList: [],
            masterDocList: [],
            dialogConfirmation: false,
            viewerVisible: false,
            viewerImages: [],
            saveFlag: 0,
            modal: false,
            dbImageList: [],
            dbImageRemoveList: [],
            documentMortgage: [],
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
        let tmpMortgage = navigation.getParam('mortgage');
        let deedType = navigation.getParam('deedType');
        let headerTitle = ((tmpMortgage && tmpMortgage.id) ? '' : 'Add ') + ((deedType.scope == 'master') ? 'Mortgage' : deedType.name);
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
            await this.loadDeedList();
        } else
            await this.loadMasterDocumentList();
        await this.loadMortgage();

        this.selectDeedType(this.state.deedType);
    };

    async saveForm() {
        let {saveFlag, tmpMortgage, title} = this.state;

        if (tmpMortgage.deedBook !== null && typeof tmpMortgage.deedBook !== 'undefined') {
            tmpMortgage.deedBook = tmpMortgage.deedBook.toUpperCase();
        }
        if (tmpMortgage.deedPage !== null && typeof tmpMortgage.deedPage !== 'undefined') {
            tmpMortgage.deedPage = tmpMortgage.deedPage.toUpperCase();
        }

        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpMortgage.dbImageList != null && tmpMortgage.dbImageList.length > 0) {
                let pos = -1;
                tmpMortgage.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpMortgage.dbImageList);
            }

            tmpMortgage.title = title;
            await this.mortgageRepository.save(tmpMortgage);

            let dbRemoveImageList = this.state.dbImageRemoveList;
            if (dbRemoveImageList.length > 0) {
                await this.dbImageRepository.remove(dbRemoveImageList);
            }

            tmpMortgage = await this.mortgageRepository.findOne({
                where: {id: tmpMortgage.id},
                relations: ['deedType', 'dbImageList', 'masterDocument', 'title']
            });
            if (!tmpMortgage.apiId) {
                await this.syncService.syncItem(this.mortgageRepository, tmpMortgage, [title]);
            }

            if (tmpMortgage.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpMortgage.dbImageList, [tmpMortgage]).then((dbImageList) => {
                    tmpMortgage.dbImageList = dbImageList;
                    this.mortgageRepository.save(tmpMortgage);
                });
            }

            this.setState((prevState) => {
                return {...prevState, saveFlag: 0}
            });

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }
    };

    saveImages(dbImageList = []) {
        let {tmpMortgage} = this.state;
        tmpMortgage.dbImageList = dbImageList;

        this.setState({tmpMortgage: tmpMortgage, dbImageList: dbImageList});
    };

    showGallery() {
        let {dbImageList} = this.state.tmpMortgage;
        if (typeof dbImageList === 'undefined' || dbImageList === null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'mortgage',
            saveImages: this.saveImages,
            removeImage: this.removeImage,
            imageListViewer: this.state.dbImageList
        });
    }

    removeImage(dbImage) {
        let dbRemoveImageList = this.state.dbImageRemoveList;
        dbRemoveImageList.push(dbImage);

        this.setState({dbImageRemoveList: dbRemoveImageList});

    }

    async loadDeedList() {
        if (!getConnection().isConnected)
            await  this.connection.connect();

        const {deedType} = this.state;
        let deedTypeList = await this.deedTypeRepository.find({docType: deedType.docType, scope: deedType.scope});

        this.setState({deedTypeList: deedTypeList});
    };

    async loadMasterDocumentList() {
        if (!getConnection().isConnected)
            await  this.connection.connect();
        let masterDocList = await this.connection.getRepository(Mortgage)
            .createQueryBuilder("mortgage")
            .leftJoinAndSelect("mortgage.deedType", "deedType")
            .leftJoinAndSelect("mortgage.title", "title")
            .where("deedType.scope = 'master' ")
            .andWhere("title.id = :titleId ", {titleId: this.state.title.id})
            .getMany();

        masterDocList.forEach((mortgage) => {
            mortgage.name = mortgage.deedType.name + ' Bk: ' + mortgage.deedBook + ' Pg: ' + mortgage.deedPage + '\n Grantor: ' + mortgage.grantor + '       Grantee: ' + mortgage.grantee;
        });

        this.setState({masterDocList: masterDocList});

        if (typeof this.state.tmpMortgage.masterDocument !== 'undefined')
            this.selectMasterDocument(this.state.tmpMortgage.masterDocument);
    };

    componentDidMount() {
        this.init();
        this.openDialog();
    }

    selectDeedType(deedType) {
        let tmpMortgage = this.state.tmpMortgage;
        tmpMortgage = {...tmpMortgage, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpMortgage: tmpMortgage,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    selectMasterDocument(masterDocument) {
        let tmpMortgage = this.state.tmpMortgage;
        let masterName = masterDocument.deedType.name + ' B: ' + masterDocument.deedBook + ' P: ' + masterDocument.deedPage;
        tmpMortgage = {...tmpMortgage, masterDocument: masterDocument};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpMortgage: tmpMortgage,
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
        if (this.state.deedType.scope == 'secondary' && typeof this.state.tmpMortgage.id == 'undefined') {
            this.setState({modal: true});
        }
    }

    async loadMortgage() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        let tmpMortgage = await this.mortgageRepository.findOne({
            where: {id: this.state.tmpMortgage.id},
            relations: ['deedType', 'dbImageList', 'masterDocument', 'title']
        });

        if (tmpMortgage != null) {
            tmpMortgage.dbImageList.sort(function (a, b) {
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
            if (tmpMortgage.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpMortgage.dbImageList, [tmpMortgage]).then((dbImageList) => {
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
                    tmpMortgage.dbImageList = dbImageList;
                    this.mortgageRepository.save(tmpMortgage).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpMortgage.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            tmpMortgage: {...tmpMortgage},
                            dbImageList: tmpMortgage.dbImageList,
                            documentMortgage: {...tmpMortgage},
                            dbImageListCopy: dbImageListCopy
                        })
                    });
                });
            }

            let dbImageListCopy = JSON.stringify(tmpMortgage.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                tmpMortgage: {...tmpMortgage},
                dbImageList: tmpMortgage.dbImageList,
                documentMortgage: {...tmpMortgage},
                dbImageListCopy: dbImageListCopy
            })
        }
    }

    showModalSave() {
        let editDocument = this.state.documentMortgage;
        let tmpMortgage = this.state.tmpMortgage;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpMortgage) ||
            JSON.stringify(this.state.dbImageList) !== JSON.stringify(this.state.dbImageListCopy)) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

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
                                    <View style={ styles.formRow }>
                                        {
                                            (this.state.deedType && this.state.deedType.scope == 'master') ?
                                                <Text style={styles.formLabel}>
                                                    Deed Type
                                                </Text>
                                                :
                                                <Text style={styles.formLabel}>
                                                    Master Document
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
                                                        }}/>

                                                </View>

                                                <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                                    <Text style={styles.formLabel}>
                                                        Deed Date
                                                    </Text>
                                                </View>
                                                <DatePicker
                                                    style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                                    date={ this.state.tmpMortgage.deedDate }
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
                                                        let tmpMortgage = {...this.state.tmpMortgage};
                                                        tmpMortgage.deedDate = moment(date).format("YYYY/MM/DD");
                                                        this.setState({tmpMortgage: tmpMortgage});
                                                    }}
                                                />

                                                <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                                    <Text style={styles.formLabel}>
                                                        Date Recorded
                                                    </Text>
                                                </View>
                                                <DatePicker
                                                    style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                                    date={ this.state.tmpMortgage.recDate}
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
                                                        let tmpMortgage = {...this.state.tmpMortgage};
                                                        tmpMortgage.recDate = moment(date).format("YYYY/MM/DD");
                                                        this.setState({tmpMortgage: tmpMortgage});
                                                    }}
                                                />

                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label="Grantor"
                                                        style={styles.formControl}
                                                        value={ this.state.tmpMortgage.grantor }
                                                        onChangeText={ (grantor) => {
                                                            let tmpMortgage = {...this.state.tmpMortgage};
                                                            tmpMortgage.grantor = grantor;
                                                            this.setState({tmpMortgage: tmpMortgage});
                                                        }}
                                                    />
                                                </View>

                                                < View style={styles.formRow}>
                                                    <TextInput
                                                        label="Grantee"
                                                        style={styles.formControl}
                                                        value={ this.state.tmpMortgage.grantee }
                                                        onChangeText={ (grantee) => {
                                                            let tmpMortgage = {...this.state.tmpMortgage};
                                                            tmpMortgage.grantee = grantee;
                                                            this.setState({tmpMortgage: tmpMortgage});
                                                        }}
                                                    />
                                                </View>

                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label="Amount Borrowed $"
                                                        placeholder="$"
                                                        style={styles.formControl}
                                                        keyboardType="numeric"
                                                        value={this.state.tmpMortgage.amountBorrowed ? String(this.state.tmpMortgage.amountBorrowed) : null}
                                                        onChangeText={ (amountBorrowed) => {
                                                            let tmpMortgage = {...this.state.tmpMortgage};
                                                            tmpMortgage.amountBorrowed = amountBorrowed;
                                                            this.setState({tmpMortgage: tmpMortgage});
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                            : <View>
                                            {(this.state.deedType.scope == 'secondary' && typeof this.state.tmpMortgage.id == 'undefined') ?
                                                <SafeAreaView>
                                                    <Portal>
                                                        <Dialog
                                                            style={stylesMortgage.dialogFlat}
                                                            visible={this.state.modal}
                                                            dismissable={false}>
                                                            <Dialog.Title style={{textAlign: 'center', fontSize: 16}}>
                                                                Attach To:</Dialog.Title>
                                                            <Dialog.ScrollArea>
                                                                {(masterDocList.length > 0) ?
                                                                    <FlatList
                                                                        style={{paddingTop: 5}}
                                                                        data={masterDocList}
                                                                        keyExtractor={this.keyExtractor}
                                                                        renderItem={({item}) =>
                                                                            <View>
                                                                                <TouchableOpacity
                                                                                    onPress={() => {
                                                                                        this.selectMasterDocument(item);
                                                                                        this.setState({modal: false})
                                                                                    }}
                                                                                    style={[stylesMortgage.card]}>
                                                                                    <Text
                                                                                        style={ stylesMortgage.name }>{item.deedType.name}:
                                                                                        Bk: {item.deedBook}
                                                                                        Pg: {item.deedPage} </Text>
                                                                                    <View style={{
                                                                                        flexDirection: 'row',
                                                                                        justifyContent: 'space-between',
                                                                                        marginHorizontal: 10
                                                                                    }}>
                                                                                        <Text
                                                                                            style={[stylesMortgage.name, {flex: 1}]}
                                                                                            numberOfLines={1}>Grantor: {item.grantor}</Text>
                                                                                        <Text
                                                                                            style={[stylesMortgage.name, {flex: 1}]}
                                                                                            numberOfLines={1}>Grantee: {item.grantee}</Text>
                                                                                    </View>
                                                                                </TouchableOpacity>
                                                                            </View>
                                                                        }
                                                                    />
                                                                    : <View>
                                                                        <Text style={{
                                                                            marginVertical: 30,
                                                                            textAlign: 'center',
                                                                        }}>No Master Documents</Text>
                                                                    </View>
                                                                }
                                                                <View style={{marginTop: 100}}>
                                                                    <Button
                                                                        style={stylesMortgage.button}
                                                                        color={Palette.light}
                                                                        mode="contained"
                                                                        onPress={() => {
                                                                            this.closeDialog();
                                                                        }}>
                                                                        <Text
                                                                            style={stylesMortgage.textButton}>Cancel</Text>
                                                                    </Button>
                                                                </View>
                                                            </Dialog.ScrollArea>
                                                        </Dialog>
                                                    </Portal>
                                                </SafeAreaView>
                                                : null}
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
                                        (this.state.deedType.code === 'assignment_transferred') ?
                                            <View>
                                                <View style={styles.formRow}>
                                                    <TextInput
                                                        label="Assigned / Transferred to"
                                                        style={styles.formControl}
                                                        value={this.state.tmpMortgage.assignedTransfer ? String(this.state.tmpMortgage.assignedTransfer) : null}
                                                        onChangeText={ (assignedTransfer) => {
                                                            let tmpMortgage = {...this.state.tmpMortgage};
                                                            tmpMortgage.assignedTransfer = assignedTransfer;
                                                            this.setState({tmpMortgage: tmpMortgage});
                                                        }}
                                                    />
                                                </View>
                                            </View>
                                            : null
                                    }
                                    <View style={ styles.formRow }>
                                        <Text style={styles.formLabel}>
                                            Deed Book + Page
                                        </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <BookPageForm
                                            item={this.state.tmpMortgage}
                                            bookName="deedBook"
                                            pageName="deedPage"
                                            onChange={item => {
                                                this.setState({tmpMortgage: item})
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
                        <View style={styles.formBottomButton}>
                            <Button style={styles.screenButton}
                                    mode="contained"
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : (this.state.tmpMortgage.id) ? 'Save Document' : 'Add Document to Title'}</Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}
export default withTheme(MortgageForm);

const stylesMortgage = StyleSheet.create({
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
        alignContent: 'center',
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