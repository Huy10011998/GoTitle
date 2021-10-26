import React, {Component} from 'react';

import {View, ScrollView, TouchableOpacity, Linking, Text, SafeAreaView,StyleSheet, KeyboardAvoidingView, Platform, Image, ImageBackground} from "react-native";

import {Button, TextInput, Title, Paragraph, Checkbox, HelperText, Appbar} from 'react-native-paper';
import Icon1  from 'react-native-vector-icons/Octicons';

import styles from './register.style.js';
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection, Check} from 'typeorm';
import { AuthService} from "src/services/index";

import photoStarScreen from '../../images/bg.jpg'
import FeatherIcon from "react-native-vector-icons/Feather"


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

export default class SignUp extends Component {

    static navigationOptions = {
        headerShown: false
    };

    constructor(props) {
        super(props);
        this.manager = getManager();
        this.connection = getConnection();

        this.state = {
            firstName: '',
            lastName: '',
            companyName: '',
            email: '',
            password: '',
            confirmPassword: '',
            checked: false,
            signUp:false,
            errorFirstName: false,
            errorLastName:false,
            errorEmail:false,
            errorPassword:false,
            errorMessage:{}
        };

        this.state = {
            secureTextEntry: true,
            iconName: "eye",
            secureTextEntryConfirm: true,
            iconNameConfirm: "eye"
        }
    }

    onIconPressPassword = () => {
        let iconName = (this.state.secureTextEntry) ? "eye-closed" : "eye";
        this.setState({
            secureTextEntry: !this.state.secureTextEntry,
            iconName: iconName
        });
    }

    onIconPressConfirm = () => {
        let iconNameConfirm = (this.state.secureTextEntryConfirm) ? "eye-closed" : "eye";
        this.setState({
            secureTextEntryConfirm: !this.state.secureTextEntryConfirm,
            iconNameConfirm: iconNameConfirm
        });
    }

    registerUser (){

        const {firstName, lastName, companyName, email, password ,confirmPassword,checked,signUp} = this.state;

        if (!this.connection.isConnected)
            this.connection.connect();
        AuthService.signUp(firstName, lastName, companyName, email, password, confirmPassword,checked,signUp).then(async (result) => {

            this.props.navigation.navigate("Login");

        }, error => {
            this.setState({errorMessage:error});

            if(typeof error.errors.firstName !=='undefined' && error.errors.firstName !== null){
                this.setState({errorFirstName:true})
            }
            if(typeof error.errors.lastName !=='undefined' && error.errors.lastName !== null){
                this.setState({errorLastName:true})
            }
            if(typeof error.errors.email !=='undefined' && error.errors.email !== null){
                this.setState({errorEmail:true})
            }
            if(typeof error.errors.password !=='undefined' && error.errors.password !== null){
                this.setState({errorPassword:true})
            }

            console.warn('register error', error);

            if(error.status === 422)

                alert(error.message);
        });

    };



    render() {
        const {checked,error,errorFirstName,errorLastName,errorEmail,errorPassword,errorMessage} = this.state;
        const {navigate} = this.props.navigation;
        return (
            <BackgroundImage style={{flex: 1,  backgroundColor: '#fff'}}>
                 <TouchableOpacity onPress={() => navigate('Login')}>
                                <View style={{flexDirection: 'row', paddingTop: 60}}>

                                    <View style={styles.iconView}>
                                        <FeatherIcon name="chevron-left" size={33} color={Palette.primary} style={{marginLeft: 10}}/>
                                    </View >

                                    {/* <View style={{justifyContent: 'center', fontWeight: '600'}}>
                                         <Text style={{color: '#006eaf', fontSize: 17}}>
                                                 Back
                                        </Text>
                                    </View> */}
                                                
                                </View>
                                        
                </TouchableOpacity>
                <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center'}}
                    behavior={Platform.OS == "ios"? "padding": null} enabled={Platform.OS == "ios"? true: false} keyboardVerticalOffset={0}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} keyboardShouldPersistTaps="handled">
                                <View style={styles.container}>
                                    <Title style={styles.titleRegister}>
                                           Create new account
                                    </Title>

                                    <View style={{marginTop: 10}}>
                                        <Text style={{fontWeight:'bold', color: '#000'}}>
                                            First name:
                                        </Text>
                                    </View>
                                    <View style={styles.groupForm}>
                                        <View style={{flex:1,flexDirection:'column'}}>
                                            <TextInput
                                                style={styles.input}
                                                backgroundColor="#fff"
                                                mode="flat"
                                                underlineColor="none"
                                                placeholder="McPherion"
                                                value={this.state.firstName}
                                                error={errorFirstName}
                                                onChangeText={text => this.setState({firstName: text, errorFirstName: false})}
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
                                            {
                                                (this.state.errorFirstName)?
                                                    <HelperText type="error" visible={errorFirstName} >
                                                        {errorMessage.errors.firstName}
                                                    </HelperText>
                                                    :null
                                            }
                                        </View>
                                    </View>
                                    <View style={styles.titleInput}>
                                        <Text style={{fontWeight: 'bold', color: '#000'}}>
                                            Last name:
                                        </Text>
                                    </View>
                                    <View style={styles.groupForm}>
                                        <View style={{flex:1,flexDirection:'column'}}>
                                            <TextInput
                                                style={styles.input}
                                                backgroundColor="#fff"
                                                mode="flat"
                                                underlineColor="none"
                                                placeholder="Manny"
                                                value={this.state.lastName}
                                                error={errorLastName}
                                                onChangeText={text => this.setState({lastName: text, errorLastName: false})}
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
                                            {
                                                (this.state.errorLastName)?

                                                    <HelperText type="error" visible={errorLastName}  >
                                                        {errorMessage.errors.lastName}
                                                    </HelperText>:null
                                            }
                                        </View>
                                    </View>
                                    <View style={styles.titleInput}>
                                        <Text style={{fontWeight: 'bold',color: '#000'}}>
                                            Company name:
                                        </Text>
                                    </View>
                                    <View style={styles.groupForm}>
                                        <TextInput
                                            style={styles.input}
                                            backgroundColor="#fff"
                                            mode="flat"
                                            underlineColor="none"
                                            placeholder="H2Technology"
                                            value={this.state.companyName}
                                            onChangeText={text => this.setState({companyName: text})}
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
                                    <View style={styles.titleInput}>
                                        <Text style={{fontWeight: 'bold',color: '#000'}}>
                                            Email:
                                        </Text>
                                    </View>
                                    <View style={styles.groupForm}>
                                        <View style={{flex:1,flexDirection:'column'}}>
                                            <TextInput
                                                style={styles.input}
                                                backgroundColor="#fff"
                                                autoCapitalize="none"
                                                mode="flat"
                                                underlineColor="none"
                                                placeholder="mandy_music@gmail.com"
                                                keyboardType="email-address"
                                                textContentType="emailAddress"
                                                value={this.state.email}
                                                error={errorEmail}
                                                onChangeText={text => this.setState({email: text,errorEmail:false})}
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
                                            {
                                                (this.state.errorEmail)?
                                                    <HelperText type="error" visible={errorEmail}>
                                                        {errorMessage.errors.email}
                                                    </HelperText>:null
                                            }
                                        </View>

                                    </View>
    
                                    <View style={styles.titleInput}>
                                        <Text style={{fontWeight: 'bold',color: '#000'}}>
                                            Password:
                                        </Text>
                                    </View>

                                    <View style={styles.groupForm}>
                                        <View style={{flex:1,flexDirection:'row'}}>
                                            <TextInput {...this.props}
                                                style={styles.input}
                                                backgroundColor="#fff"
                                                autoCapitalize="none"
                                                mode="flat"
                                                underlineColor="none"
                                                placeholder="********"
                                                secureTextEntry={this.state.secureTextEntry}
                                                value={this.state.password}
                                                error={errorPassword}
                                                onChangeText={password => this.setState({password:password,errorPassword:false})}
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
                                            {
                                                (this.state.errorPassword)?
                                                    <HelperText type="error" visible={errorPassword}>
                                                        {errorMessage.errors.password}
                                                    </HelperText>:null
                                            }
                                            <View style={{justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                                                <TouchableOpacity onPress={this.onIconPressPassword}>
                                                    <Icon1 name={this.state.iconName} size={25} color={Palette.graytextinput}/>
                                                </TouchableOpacity>
                                            </View>
                                        </View>

                                    </View>
                                    <View style={styles.titleInput}>
                                        <Text style={{fontWeight: 'bold',color: '#000'}}>
                                            Confirm password:
                                        </Text>
                                    </View>

                                    <View style={styles.groupForm}>
                                    <View style={{flex:1,flexDirection:'row'}}>
                                        <TextInput {...this.props}
                                            style={styles.input}
                                            backgroundColor="#fff"
                                            mode="flat"
                                            autoCapitalize="none"
                                            underlineColor="none"
                                            placeholder="********"
                                            secureTextEntry={this.state.secureTextEntryConfirm}
                                            value={this.state.confirmPassword}
                                            onChangeText={confirmPassword => this.setState({confirmPassword:confirmPassword})}
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
                                         <View style={{justifyContent: 'center', alignItems: 'center', marginRight: 10}}>
                                                <TouchableOpacity onPress={this.onIconPressConfirm}>
                                                    <Icon1 name={this.state.iconNameConfirm} size={25} color={Palette.graytextinput}/>
                                                </TouchableOpacity>
                                        </View>
                                    </View>
                                        
                                    </View>  
                                    
                                    <View style={styles.textAccept}>
                                        <Checkbox
                                            color={'#2196F3'}
                                            status={checked ? 'checked' : 'unchecked'}
                                            error={error}
                                            onPress={() => {
                                                this.setState({checked: !checked,error:error});
                                            }}
                                            />
                                        <TouchableOpacity onPress={() => {
                                            Linking.openURL('https://alte.io/')
                                        }}>
                                            <Paragraph style={{color: '#000', fontWeight: 'bold'}}>Accept terms and conditions</Paragraph>
                                        </TouchableOpacity>
                                </View>
                                    
                                <View style={[styles.groupButtonRegister, {marginBottom: 25}]}>
                                        <Button 
                                        style={styles.groupButton}
                                        mode="contained"
                                        color={Palette.primary}
                                        labelStyle={{fontWeight: 'bold'}}
                                        uppercase={false}
                                                onPress={() => {
                                                    this.registerUser();
                                                }}
                                        >
                                            Sign up with email
                                        </Button>
                                </View>

                                </View>
                                   
                    </ScrollView>
                </KeyboardAvoidingView>
            </BackgroundImage>
        );
    }
}

