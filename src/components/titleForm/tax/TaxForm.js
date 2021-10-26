import React, {Component} from "react";
import {
    ScrollView,
    Text,
    View,
    SafeAreaView,
    KeyboardAvoidingView, Platform
} from "react-native";
import {Header} from "react-navigation-stack";
import {Button, Card, IconButton, TextInput, withTheme} from "react-native-paper";
import Icon from "react-native-vector-icons/MaterialIcons";

import DatePicker from "react-native-datepicker";

import {styles} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {TaxRepository, DbImageRepository} from 'src/repositories/index';
import {Tax, DeedType, DbImage} from 'src/entities/index';
import SyncService from 'src/services/SyncService';
import ModalSave from 'src/components/reusable/ModalSave';

import FeatherIcon from "react-native-vector-icons/Feather"
import { TouchableOpacity } from "react-native-gesture-handler";



const moment = require("moment");

class TaxForm extends Component {

    constructor(props) {
        super(props);
        this.manager = getManager();
        this.connection = getConnection();
        this.syncService = new SyncService();
        this.taxRepository = getCustomRepository(TaxRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);

        const tmpTitle = this.props.navigation.getParam('title');
        let deedType = this.props.navigation.getParam('deedType');
        let tax = this.props.navigation.getParam('tax', {});
        this.state = {
            showGallery: false,
            deedType: deedType,
            title: {...tmpTitle},
            tmpTax: tax,
            labelSelected: deedType.name,
            deedTypeList: [],
            dialogConfirmation: false,
            viewerVisible: false,
            viewerImages: [],
            saveFlag: 0,
            dbImageRemoveList: [],
            dbImageList: [],
            documentTax: [],
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
        let tmpTax = navigation.getParam('tax');
        let headerTitle = ((tmpTax && tmpTax.id) ? '' : 'Add ') + 'Tax';
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
        await this.loadTaxList();
        await this.loadTaxImage();
        this.selectDeedType(this.state.deedType);
    };

    async saveForm() {
        let {saveFlag, tmpTax, dbImageRemoveList, title} = this.state;
        if (saveFlag === 0) {
            this.setState((prevState) => {
                return {...prevState, saveFlag: 1}
            });
            if (!this.connection.isConnected)
                await this.connection.connect();

            if (tmpTax.dbImageList != null && tmpTax.dbImageList.length > 0) {
                let pos = -1;
                tmpTax.dbImageList.forEach(dbImage => {
                    pos++;
                    dbImage.position = pos;
                });
                await this.dbImageRepository.save(tmpTax.dbImageList);
            }

            tmpTax.title = title;
            await this.taxRepository.save(tmpTax);

            if (dbImageRemoveList.length > 0) {
                await this.dbImageRepository.remove(dbImageRemoveList);
            }

            tmpTax = await this.taxRepository.findOne({
                where: {id: tmpTax.id},
                relations: ['deedType', 'dbImageList', 'title']
            });

            if (!tmpTax.apiId) {
                await this.syncService.syncItem(this.taxRepository, tmpTax, [title]);
            }

            if (tmpTax.apiId) {
                this.syncService.syncList(this.dbImageRepository, tmpTax.dbImageList, [tmpTax]).then((dbImageList) => {
                    tmpTax.dbImageList = dbImageList;
                    this.taxRepository.save(tmpTax);
                });
            }

            this.setState({showModal: false, saveFlag: 0});

            this.props.navigation.goBack();
        }
    };

    saveImages(dbImageList = []) {
        let {tmpTax} = this.state;
        tmpTax.dbImageList = dbImageList;
        this.setState({tmpTax: tmpTax, dbImageList: dbImageList});
    };

    showGallery() {
        let {dbImageList} = this.state.tmpTax;
        if (typeof dbImageList === 'undefined' || dbImageList === null)
            dbImageList = [];
        this.props.navigation.navigate('imageGallery', {
            dataSource: dbImageList,
            title: this.state.title,
            folder: 'tax',
            saveImages: this.saveImages,
            removeImage: this.removeImage,

        });
    }

    removeImage(dbImage) {
        let dbRemoveImageList = this.state.dbImageRemoveList;
        dbRemoveImageList.push(dbImage);
        this.setState({dbImageRemoveList: dbRemoveImageList})
    }

    async loadTaxList() {
        if (!this.connection.isConnected)
            await  this.connection.connect();

        const {deedType} = this.state;
        let deedTypeList = await this.manager.find(DeedType, {docType: deedType.docType, scope: deedType.scope});

        this.setState({deedTypeList: deedTypeList});
    };

    componentDidMount() {
        this.init();
    }

    selectDeedType(deedType) {
        let tmpTax = this.state.tmpTax;
        tmpTax = {...tmpTax, deedType: deedType};
        this.setState((prevState) => {
            return {
                ...prevState,
                tmpTax: tmpTax,
                labelSelected: deedType.name,
                deedType: deedType
            }
        });
    };

    async loadTaxImage() {
        if (!this.connection.isConnected)
            await  this.connection.connect();

        let tmpTax = await this.manager.findOne(Tax, {
            where: {id: this.state.tmpTax.id},
            relations: ['dbImageList', 'deedType', 'title']
        });
        if (tmpTax != null) {
            tmpTax.dbImageList.sort(function (a, b) {
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
            if (tmpTax.apiId) {
                await this.syncService.syncList(this.dbImageRepository, tmpTax.dbImageList, [tmpTax]).then((dbImageList) => {
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
                    tmpTax.dbImageList = dbImageList;
                    this.taxRepository.save(tmpTax).then(() => {
                        let dbImageListCopy = JSON.stringify(tmpTax.dbImageList);
                        dbImageListCopy = JSON.parse(dbImageListCopy);
                        this.setState({
                            tmpTax: tmpTax,
                            dbImageList: tmpTax.dbImageList,
                            documentTax: {...tmpTax},
                            dbImageListCopy: dbImageListCopy
                        });
                    });
                });
            }
            let dbImageListCopy = JSON.stringify(tmpTax.dbImageList);
            dbImageListCopy = JSON.parse(dbImageListCopy);
            this.setState({
                tmpTax: tmpTax,
                dbImageList: tmpTax.dbImageList,
                documentTax: {...tmpTax},
                dbImageListCopy: dbImageListCopy
            });
        }
    }

    showModalSave() {
        let editDocument = this.state.documentTax;
        let tmpTax = this.state.tmpTax;
        this.state.dbImageList.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        this.state.dbImageListCopy.forEach((dbImage) => {
            delete dbImage.imageData.props;
        });
        if (JSON.stringify(editDocument) !== JSON.stringify(tmpTax) ||
            JSON.stringify(this.state.dbImageList) !== JSON.stringify(this.state.dbImageListCopy)) {
            this.setState({showModal: true});
        } else {
            this.props.navigation.goBack();
        }
    };


    render() {
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
                                        <Text style={[styles.formLabel, {marginLeft: 0}]}>County Taxes:</Text>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                placeholder="County"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={ this.state.tmpTax.county }
                                                onChangeText={ (county) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.county = county;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                placeholder="Tax Year"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={ this.state.tmpTax.taxYear }
                                                onChangeText={ (taxYear) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.taxYear = taxYear;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                placeholder="Taxpayer Name"
                                                style={styles.formControl}
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                value={ this.state.tmpTax.taxpayerName }
                                                onChangeText={ (taxpayerName) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.taxpayerName = taxpayerName;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Assessed Value $"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.assessedValue ? String(this.state.tmpTax.assessedValue) : null}
                                                onChangeText={ (assessedValue) => {
                                                    let {tmpTax} = this.state;
                                                    tmpTax.assessedValue = assessedValue;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                placeholder="Parcel ID"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={ this.state.tmpTax.parcelId }
                                                onChangeText={ (parcelId) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.parcelId = parcelId;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                placeholder="Amount Paid $"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.amountPaid ? String(this.state.tmpTax.amountPaid) : null}
                                                onChangeText={ (amountPaid) => {
                                                    let {tmpTax} = this.state;
                                                    tmpTax.amountPaid = amountPaid;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                        <Text style={styles.formLabel}>
                                            Date Paid:
                                        </Text>
                                    </View>
                                    <DatePicker
                                        style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                        date={ this.state.tmpTax.datePaid}
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
                                            let tmpTax = {...this.state.tmpTax};
                                            tmpTax.datePaid = moment(date).format("YYYY/MM/DD");
                                            this.setState({tmpTax: tmpTax});
                                        }}
                                    />

                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Amount Owed $"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.amountOwned ? String(this.state.tmpTax.amountOwned) : null}
                                                onChangeText={ (amountOwned) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.amountOwned = amountOwned;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                        <Text style={styles.formLabel}>
                                            Date Due:
                                        </Text>
                                    </View>
                                    <DatePicker
                                        style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                        date={ this.state.tmpTax.dateDue}
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
                                            let tmpTax = {...this.state.tmpTax};
                                            tmpTax.dateDue = moment(date).format("YYYY/MM/DD");
                                            this.setState({tmpTax: tmpTax});
                                        }}
                                    />
                                </Card.Content>
                            </Card>

                            <Card style={ styles.card }>
                                <Card.Content>
                                    <View style={styles.formRow}>
                                        <Text style={[styles.formLabel, {marginLeft: 0}]}>
                                            Municipal Taxes:
                                        </Text>
                                    </View>

                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                placeholder="Municipality"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={ this.state.tmpTax.municipality }
                                                onChangeText={ (municipality) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.municipality = municipality;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Account Number"
                                                style={styles.formControl}
                                                value={ this.state.tmpTax.accountNumber }
                                                onChangeText={ (accountNumber) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.accountNumber = accountNumber;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                placeholder="Amount Paid $"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.municipalAmountPaid ? String(this.state.tmpTax.municipalAmountPaid) : null}
                                                onChangeText={ (municipalAmountPaid) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.municipalAmountPaid = municipalAmountPaid;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                        <Text style={styles.formLabel}>
                                            Date Paid:
                                        </Text>
                                    </View>
                                    <DatePicker
                                        style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                        date={ this.state.tmpTax.municipalDatePaid}
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
                                            let tmpTax = {...this.state.tmpTax};
                                            tmpTax.municipalDatePaid = moment(date).format("YYYY/MM/DD");
                                            this.setState({tmpTax: tmpTax});
                                        }}
                                    />

                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Amount Owed $"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.municipalAmountOwned ? String(this.state.tmpTax.municipalAmountOwned) : null}
                                                onChangeText={ (municipalAmountOwned) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.municipalAmountOwned = municipalAmountOwned;
                                                    this.setState({tmpTax: tmpTax});
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

                                    <View style={[styles.formRow, styles.divideForm, {marginBottom: 0}]}>
                                        <Text style={styles.formLabel}>
                                            Date Due:
                                        </Text>
                                    </View>
                                    <DatePicker
                                        style={[styles.formDatePicker, {marginBottom: 8, marginTop: 0}]}
                                        date={ this.state.tmpTax.municipalDateDue}
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
                                            let tmpTax = {...this.state.tmpTax};
                                            tmpTax.municipalDateDue = moment(date).format("YYYY/MM/DD");
                                            this.setState({tmpTax: tmpTax});
                                        }}
                                    />

                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                placeholder="Tax Year"
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                style={styles.formControl}
                                                value={this.state.tmpTax.municipalTaxYear}
                                                onChangeText={ (municipalTaxYear) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.municipalTaxYear = municipalTaxYear;
                                                    this.setState({tmpTax: tmpTax});
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
                                </Card.Content>
                            </Card>

                            <Card style={ styles.card }>
                                <Card.Content>
                                    <View style={styles.formRow}>
                                        <Text style={[styles.formLabel, {marginLeft: 0}]}>
                                            Services:
                                        </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Water $"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.water ? String(this.state.tmpTax.water) : null}
                                                onChangeText={ (water) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.water = water;
                                                    this.setState({tmpTax: tmpTax});
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
                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Sewer $"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.sewer ? String(this.state.tmpTax.sewer) : null}
                                                onChangeText={ (sewer) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.sewer = sewer;
                                                    this.setState({tmpTax: tmpTax});
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
                                    <View style={[styles.formRow,styles.formText]}>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                label=""
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Sanitation $"
                                                style={styles.formControl}
                                                keyboardType="numeric"
                                                value={this.state.tmpTax.sanitation ? String(this.state.tmpTax.sanitation) : null}
                                                onChangeText={ (sanitation) => {
                                                    let tmpTax = {...this.state.tmpTax};
                                                    tmpTax.sanitation = sanitation;
                                                    this.setState({tmpTax: tmpTax});
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
                                </Card.Content>
                            </Card>

                            <Card style={ styles.card }>
                                <Card.Content>
                                    <View style={styles.formRow}>
                                        <Text style={[styles.formLabel, {marginLeft: 0}]}>
                                            Tax Documents:
                                        </Text>
                                    </View>
                                    <View style={styles.formRow}>
                                        <TouchableOpacity onPress={() => {
                                            this.showGallery();
                                        }}>
                                            <Icon name="insert-drive-file" size={40} color={Palette.secondary}/>
                                        </TouchableOpacity>
                                        <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                                            <TextInput
                                                style={styles.formControl}
                                                backgroundColor="#fff"
                                                mode= "flat"
                                                underlineColor="none"
                                                placeholder="Document Description"
                                                value={this.state.tmpTax.documentDescription}
                                                onChangeText={ (documentDescription) => {
                                                    this.setState((prevState) => {
                                                        return {
                                                            ...prevState,
                                                            tmpTax: {
                                                                ...prevState.tmpTax,
                                                                documentDescription: documentDescription
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
                                    </View>
                                    <Button
                                        labelStyle={{fontWeight: 'bold'}}
                                        icon="camera-outline"
                                        mode="contained"
                                        uppercase={false}
                                        onPress={() => {
                                            this.showGallery();
                                        }}
                                        style={{marginVertical: 10, height: 50, borderWidth: 1, borderRadius: 12, justifyContent: 'center'}}>Add Tax Documents</Button>

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
                        <View style={[styles.formBottomButton]}>
                            <Button style={styles.screenButton}
                                    labelStyle={{fontWeight: 'bold'}}
                                    uppercase={false}
                                    mode="contained"
                                    onPress={() => this.saveForm()}>{this.state.saveFlag ? 'Saving...' : (this.state.tmpTax.id) ? 'Save Document' : 'Add Tax Info to Title'}</Button>
                        </View>

                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

export default withTheme(TaxForm);