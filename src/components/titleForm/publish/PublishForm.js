import React, {Component} from "react";
import {ScrollView, View, SafeAreaView, KeyboardAvoidingView, Platform, StyleSheet, Linking} from "react-native";
import {Header} from "react-navigation-stack";
import {
    Button,
    Card,
    TextInput,
    Title,
    IconButton,
    Switch,
    Text,
    Portal,
    Dialog
} from "react-native-paper";
import {styles} from "src/Style/app.style";
import {Palette} from 'src/Style/app.theme';
import {getManager, getConnection, getCustomRepository} from "typeorm";
import {TitleRepository, CustomerRepository} from 'src/repositories/index';
import Icon from "react-native-vector-icons/MaterialIcons";
import {Title as TitleEntity, TitleDetail, Customer, User} from "src/entities/index";
import SyncService from 'src/services/SyncService';
import {TitleService, InvoiceService} from 'src/services/index';
import AsyncStorage from "@react-native-community/async-storage";
import NetInfo from "@react-native-community/netinfo";
import ModalSave from 'src/components/reusable/ModalSave';
import {ENDPOINT} from 'react-native-dotenv';

export default class PublishForm extends Component {

    constructor(props) {
        super(props);

        this.titleRepository = getCustomRepository(TitleRepository);
        this.customerRepository = getCustomRepository(CustomerRepository);

        const title = this.props.navigation.getParam('title', {
            certifiedByUser: false,
            status: 'draft',
            titleDetail: {}
        });
        const titleDetail = this.props.navigation.getParam('titleDetail', {});
        let tmpTitle = {...title};
        if (!tmpTitle.status)
            tmpTitle.status = "draft";
        this.syncService = new SyncService();
        this.state = {
            tmpTitle: tmpTitle,
            tmpTitleDetail: {...titleDetail},
            tmpInvoice: null,
            saveFlag: 0,
            showMessage: false,
            showError: false,
            error: '',
            tmpCustomer: {},
            editableInput: false,
            disabledButton: false,
            sendNotificationFlag: 0,
            previewFlag: 0,
            documentTitle: [],
            documentTitleDetail: [],
            documentCustomer: [],
            showModal: false,
            ccme: false,
            overWrite: false,
            status: 'draft',
            showModelNotify: false,
            invoiceApiId: 0,
            hasEmailError: false,
            hasClientPriceError: false
        };
        this.publishTitle = this.publishTitle.bind(this);
        this.connection = getConnection();
        this.manager = getManager();
        this.publishTitle = this.publishTitle.bind(this);
        this.props.navigation.setParams({saveForm: this.publishTitle});
        this.loadShowMessage();

        this.showModalSave = this.showModalSave.bind(this);
        this.props.navigation.setParams({showModalSave: this.showModalSave});
    }

    static navigationOptions = ({navigation}) => {
        return {
            headerRight: (
                <IconButton
                    icon="check" color="white" size={25}
                    onPress={navigation.getParam('publishTitle')}
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

    async getToken() {
        let token = await  AsyncStorage.getItem('user-token');
        if (!token)
            token = '';
        return token;
    };

    async saveData() {
        let {saveFlag, tmpTitle} = this.state;

        if (tmpTitle.location && tmpTitle.location.placeId != null) {
            if (saveFlag === 0) {
                this.setState((prevState) => {
                    return {...prevState, saveFlag: 1}
                });
                if (!this.connection.isConnected)
                    await this.connection.connect();

                let {tmpTitleDetail, tmpCustomer} = this.state;
                await this.customerRepository.save(tmpCustomer);

                tmpTitle.customer = tmpCustomer;
                tmpTitle.titleDetail = tmpTitleDetail;
                await this.titleRepository.save(tmpTitle);
                await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => console.warn('PublishForm SaveData title', err));
                await this.syncService.syncItem(this.customerRepository, tmpCustomer, [tmpTitle]).catch(err => console.warn('PublishForm SaveData customer', err));

                if (!this.state.showError) {
                    this.setState((prevState) => {
                        return {...prevState, saveFlag: 0, showModal: false}
                    });
                    this.props.navigation.goBack();
                }
            }
        } else {
            this.setState({showMessage: true})
        }
    };

    async publishTitle() {
        let {saveFlag, tmpTitle, tmpTitleDetail, tmpCustomer, error, showError} = this.state;
        showError = false;

        if (tmpTitle.location.placeId != null && tmpTitle.certifiedByUser) {
            if (saveFlag === 0) {
                this.setState((prevState) => {
                    return {...prevState, saveFlag: 1}
                });
                if (!this.connection.isConnected)
                    await this.connection.connect();
                if (tmpCustomer)
                    await this.customerRepository.save(tmpCustomer);
                tmpTitle.customer = tmpCustomer;
                tmpTitle.titleDetail = tmpTitleDetail;
                await this.titleRepository.save(tmpTitle);

                tmpTitle.lastTitleStep = 'finalize';
                tmpTitle.status = 'published';

                await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => {
                    console.warn('PublishForm PublishTitle sync title', err);
                    tmpTitle.status = 'draft';
                    tmpTitle.lastTitleStep = 'basicInfo';
                    tmpTitle.certifiedByUser = 0;
                    if (err.statusCode == 403) error = err;
                    else error = 'Publish failed!';
                    showError = true;
                });
                if (tmpCustomer)
                    await this.syncService.syncItem(this.customerRepository, tmpCustomer, [tmpTitle]).catch(err => console.warn('PublishForm PublishTitle sync customer', err));

                tmpTitle = await this.titleRepository.findOne({
                    where: {id: tmpTitle.id},
                    relations: ['customer', 'owner', 'location', 'titleDetail']
                });

                if (error) {
                    this.setState((prevState) => {
                        return {
                            ...prevState,
                            showError: showError,
                            error: error,
                            tmpTitle,
                            tmpTitleDetail: tmpTitle.titleDetail,
                            saveFlag: 0
                        }
                    });
                } else {
                    if (!this.state.showModal) {
                        if(tmpTitle.status == 'published'){
                            alert('Your title was published to TitleCloud successfully');
                        }
                        this.props.navigation.navigate("StartScreen");
                    } else {
                        this.props.navigation.goBack();
                    }
                    this.setState((prevState) => {
                        return {...prevState, saveFlag: 0, showModal: false}
                    });
                }
            }
        } else {
            this.setState({showMessage: true, saveFlag: 0})
        }
    };

    async loadShowMessage() {
        if (!getConnection().isConnected)
            await getConnection().connect();
        let {tmpTitle, showMessage, status, invoiceApiId, tmpInvoice} = this.state;

        tmpTitle = await this.manager.findOne(TitleEntity, {
            where: {id: tmpTitle.id},
            relations: ['customer', 'owner', 'location', 'titleDetail']
        });

        if (tmpTitle.location && tmpTitle.location.placeId != null && tmpTitle.legalAddress != null) {
            showMessage = false;
        } else {
            showMessage = true;
        }

        let token = await this.getToken();
        let response = await InvoiceService.get(tmpTitle, token).catch(err => console.warn('GetInvoice', err));
        if (response && response.results.length > 0) {
            tmpInvoice = response.results[0];
            status = tmpInvoice.status;
            invoiceApiId = tmpInvoice.id;
        } else {
            status = 'draft';
        }

        this.setState((prevState) => {
            return ({
                ...prevState,
                tmpTitle: tmpTitle,
                tmpTitleDetail: tmpTitle.titleDetail,
                tmpCustomer: tmpTitle.customer ? tmpTitle.customer : {},
                tmpInvoice,
                documentCustomer: {...tmpTitle.customer},
                documentTitle: {...tmpTitle},
                documentTitleDetail: {...tmpTitle.titleDetail},
                status, invoiceApiId, showMessage
            });
        });
    }

    async sendNotification() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        let {tmpTitle, tmpTitleDetail, tmpCustomer, sendNotificationFlag, status, ccme, invoiceApiId, tmpInvoice, overWrite} = this.state;
        let token = await this.getToken();

        if (sendNotificationFlag === 0) {
            if (!tmpCustomer || !tmpCustomer.name) {
                this.setState((prevState) => ({
                    ...prevState,
                    error: 'Please fill the client information to generate the invoice.',
                    showError: true
                }));
            } else {
                this.setState((prevState) => {
                    return {...prevState, sendNotificationFlag: 1}
                });

                await this.customerRepository.save(tmpCustomer);
                tmpTitle.customer = tmpCustomer;
                tmpTitle.titleDetail = tmpTitleDetail;
                await this.titleRepository.save(tmpTitle);
                let isConnected = await NetInfo.addEventListener((state) => isConnected = state.isConnected);

                if (isConnected) {
                    await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => console.warn('PublishForm SendNotification sync title', err));
                    await this.syncService.syncItem(this.customerRepository, tmpCustomer, [tmpTitle]).catch(err => console.warn('PublishForm SendNotification save customer', err));

                    let description = '';
                    description += tmpTitle.location.name;
                    description += ' ' + tmpTitle.searchType;
                    description += ' ' + tmpTitle.searchTypeDetail;
                    description += ' ' + (tmpTitle.searchTypeDetailValue == null) ? '' : tmpTitle.searchTypeDetailValue + (tmpTitle.searchTypeDetail == 'full' || tmpTitle.searchTypeDetail == 'limited') ? " YR" : '';

                    if (!tmpInvoice) { //Create Invoice
                        let invoiceResponse = await InvoiceService.create(tmpTitle, token, overWrite).catch(err => console.warn('InvoiceCreate', err));
                        if (invoiceResponse && invoiceResponse.results.length > 0) {
                            tmpInvoice = invoiceResponse.results[0];
                            invoiceApiId = tmpInvoice.id;
                            tmpTitle.mainInvoice = invoiceApiId;
                            await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => console.warn('PublishForm SendNotification sync title invocice', err));
                            let invoiceItemResponse = await InvoiceService.createInvoiceItem(tmpTitle, tmpInvoice, token, description, tmpTitleDetail.clientPrice).catch(err => console.warn('CreateInvoiceItem', err));
                        }
                    } else {//Update Invoice
                        let invoiceResponse = await InvoiceService.update(tmpTitle, token, overWrite).catch(err => console.warn('InvoiceUpdate', err));
                        if (invoiceResponse && invoiceResponse.results.length > 0) {
                            tmpInvoice = invoiceResponse.results[0];
                            invoiceApiId = tmpInvoice.id;
                            if (tmpInvoice.invoiceItemList) {
                                tmpInvoice.invoiceItemList.forEach(invoiceItem => {
                                    invoiceItem.description = description;
                                    invoiceItem.unitPrice = tmpTitleDetail.clientPrice;
                                    InvoiceService.updateInvoiceItem(tmpTitle, tmpInvoice, invoiceItem, token, overWrite).catch(err => console.warn('UpdateInvoiceItem', err));
                                });
                            } else {
                                await InvoiceService.createInvoiceItem(tmpTitle, tmpInvoice, token, description, tmpTitleDetail.clientPrice).catch(err => console.warn('CreateInvoiceItem', err));
                            }
                        }
                    }

                    if (tmpCustomer.email != null && tmpCustomer.email.length > 0) {
                        let customerResponse = await TitleService.sendNotification(tmpCustomer, tmpTitle, token, ccme).catch(error => {
                            console.warn("PublishForm SendNotification", error);
                            alert('Sorry your request could not be processed at this moment. Please try again later.');
                        });
                        if (customerResponse && customerResponse.results.length > 0) {
                            alert('Notification sent successfully');
                            let invoiceResponse = await InvoiceService.get(tmpTitle, token).catch(err => console.warn('GetInvoice', err));
                            if (invoiceResponse && invoiceResponse.results.length > 0) {
                                tmpInvoice = invoiceResponse.results[0];
                                status = tmpInvoice.status;
                                overWrite = false;
                            }
                        }
                    } else {
                        this.setState((prevState) => {
                            return {
                                ...prevState,
                                hasClientPriceError: true,
                                hasEmailError: true,
                                showModelNotify: false
                            }
                        });
                    }
                } else {
                    alert("No internet connection");
                }

                this.setState((prevState) => {
                    return {
                        ...prevState,
                        status: status,
                        overWrite: overWrite,
                        tmpTitle: tmpTitle,
                        tmpTitleDetail: tmpTitleDetail,
                        tmpInvoice: tmpInvoice,
                        sendNotificationFlag: 0,
                        showModelNotify: false
                    }
                });
            }

        }

    }

    showModalSave() {
        let documentTitle = this.state.documentTitle;
        let title = this.state.tmpTitle;

        if (Object.entries(documentTitle).toString() != Object.entries(title).toString()) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };

    async previewInvoice() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        let userApiId = await AsyncStorage.getItem('user-id');
        let token = await this.getToken();
        let {tmpTitle, tmpTitleDetail, tmpCustomer, overWrite, invoiceApiId, tmpInvoice, status, previewFlag} = this.state;

        if (previewFlag == 0) {
            if (!this.isValidCustomer(tmpCustomer)) {
                this.setState((prevState) => ({
                    ...prevState,
                    error: 'Please fill the client information to generate the invoice.',
                    showError: true
                }));
            } else {
                this.setState((prevState) => ({...prevState, previewFlag: 1}));
                await this.customerRepository.save(tmpCustomer);

                tmpTitle.customer = tmpCustomer;
                tmpTitle.titleDetail = tmpTitleDetail;
                await this.titleRepository.save(tmpTitle);

                let user = await this.manager.findOne(User, {where: {apiId: userApiId}});

                let isConnected = await NetInfo.addEventListener(state => isConnected = state.isConnected);
                if (isConnected) {
                    await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => console.warn('PublishForm previewInvoice sync title', err));
                    await this.syncService.syncItem(this.customerRepository, tmpCustomer, [tmpTitle]).catch(err => console.warn('PublishForm previewInvoice save customer', err));
                    if (status == 'draft') {
                        let description = '';
                        description += tmpTitle.location.name;
                        description += ' ' + tmpTitle.searchType;
                        description += ' ' + tmpTitle.searchTypeDetail;
                        description += ' ' + (tmpTitle.searchTypeDetailValue == null) ? '' : tmpTitle.searchTypeDetailValue + (tmpTitle.searchTypeDetail == 'full' || tmpTitle.searchTypeDetail == 'limited') ? " YR" : '';
                        tmpTitle.customer = tmpCustomer;
                        if (tmpInvoice) {
                            let invoiceResponse = await InvoiceService.update(tmpTitle, token, overWrite).catch(err => console.warn('InvoiceUpdate', err));
                            if (invoiceResponse && invoiceResponse.results.length > 0) {
                                tmpInvoice = invoiceResponse.results[0];
                                invoiceApiId = tmpInvoice.id;
                                if (tmpInvoice.invoiceItemList) {
                                    tmpInvoice.invoiceItemList.forEach(invoiceItem => {
                                        invoiceItem.description = description;
                                        invoiceItem.unitPrice = tmpTitleDetail.clientPrice;
                                        InvoiceService.updateInvoiceItem(tmpTitle, tmpInvoice, invoiceItem, token, overWrite).catch(err => console.warn('UpdateInvoiceItem', err));
                                    });
                                } else {
                                    await InvoiceService.createInvoiceItem(tmpTitle, tmpInvoice, token, description, tmpTitleDetail.clientPrice).catch(err => console.warn('CreateInvoiceItem', err));
                                }
                                this.openDocument(invoiceApiId);
                            }
                        } else {
                            let invoiceResponse = await InvoiceService.create(tmpTitle, token, overWrite).catch(err => console.warn('InvoiceCreate', err));
                            if (invoiceResponse && invoiceResponse.results.length > 0) {
                                tmpInvoice = invoiceResponse.results[0];
                                invoiceApiId = tmpInvoice.id;
                                tmpTitle.mainInvoice = invoiceApiId;
                                await this.syncService.syncItem(this.titleRepository, tmpTitle).catch(err => console.warn('PublishForm previewInvoice sync title invoice', err));
                                let invoiceItemResponse = await InvoiceService.createInvoiceItem(tmpTitle, tmpInvoice, token, description, tmpTitleDetail.clientPrice).catch(err => console.warn('CreateInvoiceItem', err));
                                if (invoiceItemResponse) {
                                    this.openDocument(invoiceApiId);
                                }
                            }
                        }
                    } else {
                        this.openDocument(invoiceApiId);
                    }

                } else {
                    alert("No internet connection");
                }

                this.setState((prevState) => {
                    return {
                        ...prevState,
                        tmpTitle,
                        tmpTitleDetail,
                        tmpCustomer,
                        overWrite,
                        status,
                        tmpInvoice,
                        previewFlag: 0
                    }
                });
            }

        }
    }

    openDocument(invoiceApiId) {
        let url = ENDPOINT + '/invoice/' + invoiceApiId + '?view=pdf';
        Linking.canOpenURL(url).then(res => {
            if (res) {
                Linking.openURL(url);
            }
        });
    }

    isValidCustomer(tmpCustomer){
        if(tmpCustomer == null)
            return false;
        if(!tmpCustomer.name || !tmpCustomer.name.trim()
            || !tmpCustomer.companyName || !tmpCustomer.companyName.trim()
            || !tmpCustomer.companyFileNumber || !tmpCustomer.companyFileNumber.trim())
            return false;

        this.setState((prevState) => ({
            ...prevState,
            showError: false
        }));
        return true;
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: Palette.gray}}>
                <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                      behavior={Platform.OS == "ios" ? "padding" : null}
                                      enabled={Platform.OS == "ios" ? true : false}
                                      keyboardVerticalOffset={Header.HEIGHT + 20}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                                keyboardShouldPersistTaps="handled">
                        <View style={styles.containerFlat}>
                            {
                                (this.state.showMessage) ?
                                    <Card style={stylesPublish.cards}>
                                        <Card.Content>
                                            <View style={{flex: 1, flexDirection: 'row'}}>
                                                <IconButton
                                                    icon="alert"
                                                    color="white"
                                                    style={{marginRight: 0}}
                                                />
                                                <Text style={{textAlign: 'justify', color: '#fff', marginRight: 50}}>
                                                    The Nearest Map Address must be validated with Google Place and
                                                    Legal Address in the Order Form
                                                </Text>
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    : (this.state.showError) ?
                                    <Card style={stylesPublish.cards}>
                                        <Card.Content>
                                            <View style={{flex: 1, flexDirection: 'row'}}>
                                                <IconButton
                                                    icon="alert"
                                                    color="white"
                                                    style={{marginRight: 0}}
                                                />

                                                {this.state.error && this.state.error.errorMessages ?
                                                    <View style={{flex: 1, flexDirection: 'column'}}>
                                                        {this.state.error.errorMessages.map((item) => (
                                                            <Text style={{
                                                                textAlign: 'justify',
                                                                alignSelf: 'center',
                                                                color: '#fff',
                                                                marginRight: 50
                                                            }}>{item}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                    :
                                                    <Text style={{
                                                        textAlign: 'justify',
                                                        alignSelf: 'center',
                                                        color: '#fff',
                                                        marginRight: 50
                                                    }}>{this.state.error}
                                                    </Text>
                                                }
                                            </View>
                                        </Card.Content>
                                    </Card>
                                    : null
                            }

                            <View style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 10
                            }}>
                                <Text style={{color: '#003A6F', flex: 1, margin: 10}}>
                                    I certify that this information is complete and accurate. I understand that
                                    any
                                    and
                                    every
                                    sale of this title through the Exchange is covered under my Errors &
                                    Omissions
                                    insurance
                                    policy, and that I have a current copy on file with the Exchange.
                                </Text>
                                <Switch
                                    value={(this.state.tmpTitle.certifiedByUser) ? true : false}
                                    disabled={this.state.showMessage}
                                    onValueChange={(value) => {
                                        let {tmpTitle, showError} = this.state;
                                        tmpTitle.certifiedByUser = value;
                                        showError = showError ? 0 : 0;
                                        this.setState((prevState) => {
                                            return {
                                                ...prevState,
                                                showError, tmpTitle,
                                                overWrite: false
                                            }
                                        });
                                    }}
                                />
                            </View>

                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={[styles.formColumn, {marginTop: 0}]}>
                                        <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                                            <Title style={styles.titleInput}>
                                                Client Information
                                            </Title>
                                            <View style={{flexDirection: "row", justifyContent: 'space-between'}}>
                                                <Icon name="edit" size={25}
                                                      color={(this.state.tmpTitle.certifiedByUser) ? Palette.primary : Palette.secondary}/>
                                                <Switch
                                                    value={this.state.overWrite}
                                                    disabled={(this.state.tmpTitle.certifiedByUser) ? false : true}
                                                    onValueChange={(value) => {
                                                        this.setState({overWrite: value,showError:false});
                                                    }}
                                                />
                                            </View>
                                        </View>
                                        <View>
                                            <TextInput
                                                style={styles.formControl}
                                                label="Company Name"
                                                value={this.state.tmpCustomer.companyName}
                                                editable={this.state.overWrite}
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
                                            />
                                            <TextInput
                                                style={styles.formControl}
                                                label="File Number"
                                                value={this.state.tmpCustomer.fileNumber ? String(this.state.tmpCustomer.fileNumber) : ''}
                                                editable={this.state.overWrite}
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
                                            />
                                            <TextInput
                                                style={styles.formControl}
                                                label="Client Name"
                                                value={this.state.tmpCustomer.name}
                                                editable={this.state.overWrite}
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
                                            />
                                            <TextInput
                                                style={styles.formControl}
                                                label="Client File Number "
                                                value={this.state.tmpCustomer.companyFileNumber}
                                                editable={this.state.overWrite}
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
                                            />
                                            <TextInput
                                                style={styles.formControl}
                                                label="Client Address"
                                                value={this.state.tmpCustomer.clientAddress}
                                                editable={this.state.overWrite}
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
                                            />
                                        </View>
                                        <TextInput
                                            label="Email Address"
                                            keyboardType="email-address"
                                            textContentType="emailAddress"
                                            autoCapitalize="none"
                                            disabled={!this.state.tmpTitle.certifiedByUser}
                                            style={styles.formControl}
                                            value={(this.state.tmpCustomer ? this.state.tmpCustomer.email : null)}
                                            error={this.state.hasEmailError}
                                            onChangeText={(email) => {
                                                this.setState((prevState) => {
                                                    return {
                                                        ...prevState,
                                                        tmpCustomer: {...prevState.tmpCustomer, email: email},
                                                        hasEmailError: false
                                                    }
                                                });
                                            }}
                                        >
                                        </TextInput>
                                        <View style={styles.formRow}>
                                            <TextInput
                                                label="Amount to bill this client"
                                                keyboardType="numeric"
                                                disabled={!this.state.tmpTitle.certifiedByUser}
                                                style={styles.formControl}
                                                error={this.state.hasClientPriceError}
                                                value={this.state.tmpTitleDetail.clientPrice ? String(this.state.tmpTitleDetail.clientPrice) : ""}
                                                onChangeText={clientPrice => {
                                                    let tmpTitleDetail = this.state.tmpTitleDetail;
                                                    tmpTitleDetail.clientPrice = clientPrice;
                                                    this.setState({
                                                        tmpTitleDetail: tmpTitleDetail,
                                                        hasClientPriceError: false
                                                    });
                                                }}
                                            >
                                            </TextInput>
                                            <Icon name="attach-money" size={30} color={Palette.successLight}/>
                                        </View>
                                        <View style={{flex: 1, flexDirection: "row", align: 'center', marginTop: 10}}>
                                            <Button
                                                style={{flex: 1, marginHorizontal: 5}}
                                                mode="contained"
                                                uppercase={false}
                                                disabled={this.state.tmpTitle.certifiedByUser && !this.state.showMessage ? false : true}
                                                onPress={() => {
                                                    this.previewInvoice()
                                                }}>
                                                {this.state.previewFlag ? 'Syncing...' : 'Preview Receipt'}
                                            </Button>
                                            <Button
                                                style={{flex: 1, marginHorizontal: 5}}
                                                mode="contained"
                                                uppercase={false}
                                                disabled={(this.state.tmpTitle.certifiedByUser && !this.state.showMessage) ? false : true}
                                                onPress={() => {
                                                    let {hasEmailError, hasClientPriceError, error, showError,tmpTitleDetail,tmpCustomer} = this.state;
                                                    showError = false;
                                                    if (!this.isValidCustomer(tmpCustomer)) {
                                                        error = 'Please fill the client information to generate the invoice.';
                                                        showError = true;
                                                    }
                                                    if (!tmpCustomer || !tmpCustomer.email || !tmpCustomer.email.trim())
                                                        hasEmailError = true;
                                                    if (!tmpTitleDetail.clientPrice || !String(tmpTitleDetail.clientPrice).trim())
                                                        hasClientPriceError = true;
                                                    if (hasClientPriceError || hasEmailError || showError)
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                showModelNotify: false,
                                                                hasEmailError,
                                                                hasClientPriceError,
                                                                error,
                                                                showError
                                                            }
                                                        });
                                                    else
                                                        this.setState((prevState) => {
                                                            return {
                                                                ...prevState,
                                                                showModelNotify: true,
                                                                hasEmailError,
                                                                hasClientPriceError
                                                            }
                                                        });
                                                }}>
                                                {this.state.sendNotificationFlag ? 'Sending...' : 'Send to client'}
                                            </Button>
                                        </View>
                                    </View>
                                </Card.Content>
                            </Card>
                            <Card style={styles.card}>
                                <Card.Content>
                                    <View style={[styles.formColumn, {marginTop: 0}]}>
                                        <Title style={styles.titleInput}>
                                            Wholesale Price
                                        </Title>
                                        <View style={styles.formRow}>
                                            <TextInput
                                                label="Resale price on the Exchange"
                                                keyboardType="numeric"
                                                editable={this.state.tmpTitle.certifiedByUser ? true : false}
                                                style={styles.formControl}
                                                value={this.state.tmpTitle.price ? String(this.state.tmpTitle.price) : ""}
                                                onChangeText={price => {
                                                    let tmpTitle = this.state.tmpTitle;
                                                    tmpTitle.price = price;
                                                    this.setState({tmpTitle: tmpTitle});
                                                }}
                                            >
                                            </TextInput>
                                            <Icon name="attach-money" size={30}
                                                  color={Palette.successLight}/>
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
                                                    this.saveData()
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

                                        <View style={{marginTop: 10}}>
                                            <Button style={{flex: 1, marginHorizontal: 5}}
                                                    mode="contained"
                                                    uppercase={false}
                                                    disabled={this.state.tmpTitle.certifiedByUser && !this.state.showMessage ? false : true}
                                                    onPress={() => this.publishTitle()}>{this.state.saveFlag ? 'Syncing...' : (this.state.tmpTitle.status == "published" ? "Update" : "Publish To Exchange")}</Button>
                                        </View>
                                    </View>

                                </Card.Content>
                            </Card>
                            {
                                (this.state.showModelNotify) ?
                                    <SafeAreaView>
                                        <Portal>
                                            <Dialog
                                                visible={this.state.showModelNotify}
                                                dismissable={false}
                                            >
                                                <Dialog.Content>
                                                    <View
                                                        style={{flexDirection: "row", justifyContent: 'space-between'}}>
                                                        <View>
                                                            <Text style={styles.text}>
                                                                Send a copy to your email?</Text>
                                                        </View>
                                                        <View>
                                                            <Switch
                                                                value={this.state.ccme}
                                                                disabled={this.state.showMessage}
                                                                onValueChange={(value) => {
                                                                    this.setState({ccme: value});
                                                                }}
                                                            />
                                                        </View>
                                                    </View>
                                                </Dialog.Content>
                                                <Dialog.Actions>
                                                    <Button onPress={() => {
                                                        this.sendNotification()
                                                    }}>Send</Button>
                                                    <Button onPress={() => {
                                                        this.setState({showModelNotify: false})
                                                    }}>Cancel</Button>
                                                </Dialog.Actions>
                                            </Dialog>
                                        </Portal>
                                    </SafeAreaView> : null
                            }

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
};

const stylesPublish = StyleSheet.create({
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
    textTitleCustomer: {
        fontSize: 15,
        marginLeft: 15,
        marginVertical: 2,
        color: Palette.primary,
        textTransform: 'capitalize'
    },
    textCustomer: {
        fontSize: 15,
        marginLeft: 5,
        marginVertical: 2,
        color: Palette.black,
        textTransform: 'capitalize'
    }
});