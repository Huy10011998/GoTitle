import React, {Component, useCallback} from "react";
import {View, SafeAreaView, StyleSheet, ScrollView, KeyboardAvoidingView, Platform, Linking} from "react-native";
import {Header} from "react-navigation-stack";
import {Text, Card, Checkbox, Paragraph, TouchableRipple, Button, Divider, IconButton} from "react-native-paper";
import {styles} from "src/Style/app.style";
import {Palette} from 'src/Style/app.theme';
import {getConnection, getManager, getCustomRepository} from "typeorm";
import {TitleDetail} from "src/entities/TitleDetail";
import SyncService from 'src/services/SyncService';
import FileService from 'src/services/FileService';
import ModalSave from 'src/components/reusable/ModalSave';
import {TitleRepository, TitleDetailRepository} from 'src/repositories/index';
import {ENDPOINT} from 'react-native-dotenv';

export default class DoubleCheck extends Component {
    constructor(props) {
        super(props);

        this.titleRepository = getCustomRepository(TitleRepository);
        this.titleDetailRepository = getCustomRepository(TitleDetailRepository);
        this.syncService = new SyncService();
        this.connection = getConnection();
        this.manager = getManager();

        const title = this.props.navigation.getParam('title', {titleDetail: {}});
        this.fileService = new FileService();
        this.state = {
            tmpTitle: {...title},
            tmpTitleDetail: {
                ...title.titleDetail,
                hasCivil: false,
                hasTaxes: false,
                hasLiens: false,
                hasProbateEstate: false,
                hasRealState: false,
            },
            saveFlag: 0,
            previewFlag:0,
            hideButtonPreviewYourTitle: false,
            documentTitleDetail: [],
            showModal: false
        };

        this.loadTitleDetail();
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

    async loadTitleDetail() {
        if (!this.connection.isConnected)
            await this.connection.connect();
        let {tmpTitle, tmpTitleDetail} = this.state;
        tmpTitle = await this.titleRepository.findOne(tmpTitle.id, {relations: ['location', 'titleDetail']});
        tmpTitleDetail = tmpTitle.titleDetail;
        const titleDetail = tmpTitleDetail;
        if (titleDetail != null)
            this.setState({tmpTitle: tmpTitle, tmpTitleDetail: tmpTitleDetail, documentTitleDetail: {...titleDetail}});
    }

    async saveForm() {
        let {saveFlag} = this.state;
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();
            let {tmpTitle, tmpTitleDetail} = this.state;
            tmpTitle.titleDetail = tmpTitleDetail;
            await this.titleRepository.save(tmpTitle);
            await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err=>console.warn('DoubleCheck SaveForm sync title',err));
            this.setState((prevState) => {
                return {
                    ...prevState,
                    saveFlag: 0,
                    documentTitleDetail: {...tmpTitleDetail}
                }
            });

            if (!this.state.showModal) {
                this.props.navigation.navigate("PublishForm", {
                    title: tmpTitle,
                    titleDetail: this.state.tmpTitleDetail
                });
            } else {
                this.props.navigation.goBack();
            }
            this.setState({showModal: false})
        }

    }

    async openDocument() {
        let {tmpTitle, tmpTitleDetail} = this.state;
        if(this.state.previewFlag==0){
            this.setState((prevState)=>({
                ...prevState, previewFlag: 1
            }));
            tmpTitleDetail.title = tmpTitle;
            tmpTitle.titleDetail = tmpTitleDetail;
            await this.titleRepository.save(tmpTitle);
            await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err=>console.warn('DoubleCheck OpenDocument',err));

            if (this.state.tmpTitle.tokenReportPdf != null) {
                let url = ENDPOINT + '/api/titles/report?cod=' + this.state.tmpTitle.tokenReportPdf;
                Linking.canOpenURL(url).then(res => {
                    if (res) {
                        Linking.openURL(url);
                    }
                });
            }
            this.setState((prevState) => ({...prevState, previewFlag: 0}));
        }
    }

    showModalSave() {
        let documentTitleDetail = this.state.documentTitleDetail;
        let tmpTitleDetail = this.state.tmpTitleDetail;

        if (Object.entries(documentTitleDetail).toString() !== Object.entries(tmpTitleDetail).toString()) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: Palette.gray}}>
                <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                      behavior={Platform.OS == "ios" ? "padding" : null}
                                      enabled={Platform.OS == "ios" ? true : false}
                                      keyboardVerticalOffset={Header.HEIGHT + 20}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                                keyboardShouldPersistTaps="handled">
                        <View style={ styles.containerFlat }>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <Text style={{fontSize: 12}}>
                                        Certify that you´ve researched the following records:
                                    </Text>
                                    <TouchableRipple
                                        onPress={() => {
                                            let tmpTitleDetail = this.state.tmpTitleDetail;
                                            tmpTitleDetail.hasRealState = !tmpTitleDetail.hasRealState;
                                            this.setState({tmpTitleDetail: tmpTitleDetail});
                                        }}
                                    >
                                        <View style={customStyles.row}>
                                            <Paragraph>- Real Estate </Paragraph>
                                            <View pointerEvents="none">
                                                <Checkbox
                                                    status={this.state.tmpTitleDetail.hasRealState ? 'checked' : 'unchecked'}
                                                    color={Palette.primary}
                                                />
                                            </View>

                                        </View>
                                    </TouchableRipple>
                                    <Divider />

                                    <TouchableRipple
                                        onPress={() => {
                                            let tmpTitleDetail = this.state.tmpTitleDetail;
                                            tmpTitleDetail.hasCivil = !tmpTitleDetail.hasCivil;
                                            this.setState({tmpTitleDetail: tmpTitleDetail});
                                        }}
                                    >
                                        <View style={customStyles.row}>
                                            <Paragraph>- Civil </Paragraph>
                                            <View pointerEvents="none">
                                                <Checkbox
                                                    status={this.state.tmpTitleDetail.hasCivil ? 'checked' : 'unchecked'}
                                                    color={Palette.primary}
                                                />
                                            </View>

                                        </View>
                                    </TouchableRipple>
                                    <Divider />

                                    <TouchableRipple
                                        onPress={() => {
                                            let tmpTitleDetail = this.state.tmpTitleDetail;
                                            tmpTitleDetail.hasProbateEstate = !tmpTitleDetail.hasProbateEstate;
                                            this.setState({tmpTitleDetail: tmpTitleDetail});
                                        }}
                                    >
                                        <View style={customStyles.row}>
                                            <Paragraph>- Probate / Estate </Paragraph>
                                            <View pointerEvents="none">
                                                <Checkbox
                                                    status={this.state.tmpTitleDetail.hasProbateEstate ? 'checked' : 'unchecked'}
                                                    color={Palette.primary}
                                                />
                                            </View>

                                        </View>
                                    </TouchableRipple>
                                    <Divider/>

                                    <TouchableRipple
                                        onPress={() => {
                                            let tmpTitleDetail = this.state.tmpTitleDetail;
                                            tmpTitleDetail.hasLiens = !tmpTitleDetail.hasLiens;
                                            this.setState({tmpTitleDetail: tmpTitleDetail});
                                        }}
                                    >
                                        <View style={customStyles.row}>
                                            <Paragraph>- Liens </Paragraph>
                                            <View pointerEvents="none">
                                                <Checkbox
                                                    color={Palette.primary}
                                                    status={this.state.tmpTitleDetail.hasLiens ? 'checked' : 'unchecked'}
                                                />
                                            </View>

                                        </View>
                                    </TouchableRipple>
                                    <Divider />

                                    <TouchableRipple
                                        onPress={() => {
                                            let tmpTitleDetail = this.state.tmpTitleDetail;
                                            tmpTitleDetail.hasTaxes = !tmpTitleDetail.hasTaxes;
                                            this.setState({tmpTitleDetail: tmpTitleDetail});
                                        }}
                                    >
                                        <View style={customStyles.row}>
                                            <Paragraph>- Tax (if required) </Paragraph>
                                            <View pointerEvents="none">
                                                <Checkbox
                                                    color={Palette.primary}
                                                    status={this.state.tmpTitleDetail.hasTaxes ? 'checked' : 'unchecked'}
                                                />
                                            </View>

                                        </View>
                                    </TouchableRipple>
                                    <Divider />
                                </Card.Content>
                            </Card>
                            {
                                (!this.state.hideButtonPreviewYourTitle) ?
                                    <Card style={ styles.card}>
                                        <Card.Content>
                                            <Button
                                                icon={this.state.previewFlag ? null : "file-outline"}
                                                mode="contained"
                                                style={{marginVertical: 10}}
                                                onPress={() => this.openDocument()}>
                                                {this.state.previewFlag ? 'Syncing...' : 'Preview Your Title'}
                                            </Button>
                                        </Card.Content>
                                    </Card> : null
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
                                onSave={()=>{this.saveForm()}}
                                onNoSave={()=>{
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
                            <Button styles={styles.screenButton}
                                    mode="contained"
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : 'Continue'}</Button>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

const customStyles = StyleSheet.create({
    container: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end' // if you want to fill rows left to right
    },
    boxItem: {
        flex: 1,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
});