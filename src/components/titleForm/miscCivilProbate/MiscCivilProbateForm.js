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
import BookPageForm from "src/components/titleForm/BookPageForm";

import {styles} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {MiscCivilProbateRepository, DbImageRepository} from 'src/repositories/index';
import {MiscCivilProbate, DeedType, DbImage} from 'src/entities/index';
import SyncService from 'src/services/SyncService';
import ModalSave from 'src/components/reusable/ModalSave';

import FeatherIcon from "react-native-vector-icons/Feather"
import { TouchableOpacity } from "react-native-gesture-handler";

const moment = require("moment");

import photoStarScreen from '../../../images/bg.jpg'
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

class MiscCivilProbateForm extends Component {

    constructor(props) {
        super(props);
        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.miscCivilProbateRepository = getCustomRepository(MiscCivilProbateRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let miscCivilProbate = this.props.navigation.getParam('miscCivilProbate', {});
        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpMiscCivilProbate: miscCivilProbate,
            labelSelected: deedType.name,
            labelMasterDocSelected: '',
            deedTypeList: [],
            dialogConfirmation: false,
            viewerVisible: false,
            viewerImages: [],
            saveFlag: 0,
            dbImageRemoveList: [],
            dbImageList: [],
            documentMiscCivilProbate: [],
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
        let tmpMiscCivilProbate = navigation.getParam('miscCivilProbate');
        let headerTitle = ((tmpMiscCivilProbate && tmpMiscCivilProbate.id) ? '' : 'Add ') + 'Misc | Civil | Probate';
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
        await this.loadMiscCivilProbateList();
        await this.loadMiscCivilProbateImage();
        this.selectDeedType(this.state.deedType);
    };

    async saveForm() {
        let {saveFlag, tmpMiscCivilProbate, dbImageRemoveList, title} = this.state;
        if (tmpMiscCivilProbate.book !== null && typeof tmpMiscCivilProbate.book !== 'undefined') {
            tmpMiscCivilProbate.book = tmpMiscCivilProbate.book.toUpperCase();

        }
        if (tmpMiscCivilProbate.deedPage !== null && typeof tmpMiscCivilProbate.deedPage !== 'undefined') {
            tmpMiscCivilProbate.deedPage = tmpMiscCivilProbate.deedPage.toUpperCase();
        }
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpMiscCivilProbate.dbImageList != null && tmpMiscCivilProbate.dbImageList.length > 0) {
                let pos = -1;
                tmpMiscCivilProbate.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpMiscCivilProbate.dbImageList);
            }

            tmpMiscCivilProbate.title = title;
            await this.miscCivilProbateRepository.save(tmpMiscCivilProbate);

            if (dbImageRemoveList.length > 0) {
                await this.dbImageRepository.remove(dbImageRemoveList);
            }

            tmpMiscCivilProbate = await this.miscCivilProbateRepository.findOne({
                where: {id: tmpMiscCivilProbate.id},
                relations: ['deedType', 'dbImageList', 'title']
            });

            if (!tmpMiscCivilProbate.apiId) {
                await this.syncService.syncItem(this.miscCivilProbateRepository, tmpMiscCivilProbate, [title]);
            }

            if (tmpMiscCivilProbate.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpMiscCivilProbate.dbImageList, [tmpMiscCivilProbate]).then((dbImageList) => {
                    tmpMiscCivilProbate.dbImageList = dbImageList;
                    this.miscCivilProbateRepository.save(tmpMiscCivilProbate);
                });
            }

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }
    };

    saveImages(dbImageList = []) {
        let {tmpMiscCivilProbate} = this.state;
        tmpMiscCivilProbate.dbImageList = dbImageList;
        this.setState({tmpMiscCivilProbate: tmpMiscCivilProbate, dbImageList: dbImageList});
    };

    showGallery() {
        let {dbImageList} = this.state.tmpMiscCivilProbate;
        if (typeof dbImageList === 'undefined' || dbImageList === null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'miscCivilProbate',
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

    async loadMiscCivilProbateList() {
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
        let tmpMiscCivilProbate = this.state.tmpMiscCivilProbate;
        tmpMiscCivilProbate = {...tmpMiscCivilProbate, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpMiscCivilProbate: tmpMiscCivilProbate,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    async loadMiscCivilProbateImage() {
        if (!this.connection.isConnected)
            await  this.connection.connect();
        let tmpMiscCivilProbate = await this.manager.findOne(MiscCivilProbate, {
            where: {id: this.state.tmpMiscCivilProbate.id},
            relations: ['dbImageList', 'deedType', 'title']
        });

        if (tmpMiscCivilProbate != null) {
            tmpMiscCivilProbate.dbImageList.sort(function (a, b) {
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
            if (tmpMiscCivilProbate.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpMiscCivilProbate.dbImageList, [tmpMiscCivilProbate]).then((dbImageList) => {
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
                    tmpMiscCivilProbate.dbImageList = dbImageList;
                    this.miscCivilProbateRepository.save(tmpMiscCivilProbate).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpMiscCivilProbate.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            tmpMiscCivilProbate: tmpMiscCivilProbate,
                            dbImageList: tmpMiscCivilProbate.dbImageList,
                            documentMiscCivilProbate: {...tmpMiscCivilProbate},
                            dbImageListCopy: dbImageListCopy
                        });
                    });
                });
            }
            let dbImageListCopy = JSON.stringify(tmpMiscCivilProbate.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                tmpMiscCivilProbate: tmpMiscCivilProbate,
                dbImageList: tmpMiscCivilProbate.dbImageList,
                documentMiscCivilProbate: {...tmpMiscCivilProbate},
                dbImageListCopy: dbImageListCopy
            });
        }
    }

    showModalSave() {
        let editDocument = this.state.documentMiscCivilProbate;
        let tmpMiscCivilProbate = this.state.tmpMiscCivilProbate;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpMiscCivilProbate) ||
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
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Instrument Type:</Text>
                                    </View>
                                   
                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={ this.state.tmpMiscCivilProbate.instrumentType }
                                                onChangeText={ (instrumentType) => {
                                                    let tmpMiscCivilProbate = {...this.state.tmpMiscCivilProbate};
                                                    tmpMiscCivilProbate.instrumentType = instrumentType;
                                                    this.setState({tmpMiscCivilProbate: tmpMiscCivilProbate});
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
                                        <Text style={styles.formLabel}>File Number:</Text>
                                    </View>
                                   
                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={ this.state.tmpMiscCivilProbate.fileNumber ? String(this.state.tmpMiscCivilProbate.fileNumber) : null }
                                                onChangeText={ (fileNumber) => {
                                                    let tmpMiscCivilProbate = {...this.state.tmpMiscCivilProbate};
                                                    tmpMiscCivilProbate.fileNumber = fileNumber;
                                                    this.setState({tmpMiscCivilProbate: tmpMiscCivilProbate});
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
                                        <Text style={styles.formLabel}>Book Type:</Text>
                                    </View>
                                
                                    <View style={styles.formRow}>
                                            <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                                <TextInput
                                                    label=""
                                                    backgroundColor="#fff"
                                                    mode= "flat"
                                                    underlineColor="none"
                                                    style={styles.formControl}
                                                    value={ this.state.tmpMiscCivilProbate.bookType }
                                                    onChangeText={ (bookType) => {
                                                        let tmpMiscCivilProbate = {...this.state.tmpMiscCivilProbate};
                                                        tmpMiscCivilProbate.bookType = bookType;
                                                        this.setState({tmpMiscCivilProbate: tmpMiscCivilProbate});
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

                                    <View style={ styles.formRow }>
                                        <Text style={styles.formLabel}> Book + Page </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <BookPageForm
                                            item={this.state.tmpMiscCivilProbate}
                                            bookName="book"
                                            pageName="page"
                                            onChange={item => {
                                                this.setState({tmpMiscCivilProbate: item})
                                            }}
                                            removeButton={ false }
                                            onImagePress={item => this.showGallery()}/>
                                    </View>
                                    <Button
                                        icon="camera-outline"
                                        labelStyle={{fontWeight: 'bold'}}
                                        mode="contained"
                                        uppercase={false}
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

                            <Card style={ styles.card }>
                                <Card.Content>
                                    <View style={[styles.formRow, styles.divideForm]}>
                                        <Text style={styles.formLabel}>Note:</Text>
                                    </View>
                                    <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                        <TextInput
                                            multiline
                                            backgroundColor="#fff"
                                            mode= "flat"
                                            underlineColor="none"
                                            scrollEnabled={false}
                                            style={styles.formControl}
                                            label=""
                                            value={this.state.tmpMiscCivilProbate.note}
                                            onChangeText={ (note) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpMiscCivilProbate: {
                                                            ...prevState.tmpMiscCivilProbate,
                                                            note: note
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

                        </View>
                        <View style={[styles.formBottomButton, {marginBottom: 25}]}>
                            <Button style={styles.screenButton}
                                    uppercase={false}
                                    labelStyle={{fontWeight: 'bold'}}
                                    mode="contained"
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : (this.state.tmpMiscCivilProbate.id) ? 'Save Document' : 'Add Document to Title'}</Button>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </BackgroundImage>
        );
    }
}

export default withTheme(MiscCivilProbateForm);
