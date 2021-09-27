import React, {Component} from 'react';

import {View, ScrollView, TouchableOpacity, Linking, Text, SafeAreaView,StyleSheet, KeyboardAvoidingView, Platform} from "react-native";

import {Button, TextInput, Title, Paragraph, Checkbox,HelperText} from 'react-native-paper';
import Icon  from 'react-native-vector-icons/MaterialIcons';

import styles from './register.style.js';
import {Palette} from "src/Style/app.theme";

import {getManager, getConnection} from 'typeorm';
import { AuthService} from "src/services/index";


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
            <SafeAreaView style={{flex: 1}}>
                <KeyboardAvoidingView style={{ flex: 1, flexDirection: 'column',justifyContent: 'center'}}
                    behavior={Platform.OS == "ios"? "padding": null} enabled={Platform.OS == "ios"? true: false} keyboardVerticalOffset={0}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} keyboardShouldPersistTaps="handled">
                        <View style={styles.container}>

                            <Title style={styles.titleRegister}>Register User</Title>

                            <View style={styles.groupForm}>
                                <View style={styles.iconView}>
                                    <Icon name="person" size={30} color="#757575"/>
                                </View>

                                <View style={{flex:1,flexDirection:'column'}}>
                                    <TextInput
                                        style={styles.input}
                                        mode="outlined"
                                        label='First Name'
                                        value={this.state.firstName}
                                        error={errorFirstName}
                                        onChangeText={text => this.setState({firstName: text, errorFirstName: false})}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.primary,
                                                text: Palette.primary,
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

                            <View style={styles.groupForm}>
                                <View style={styles.iconView}>
                                    {/*<Icon name="id-card" size={25} color="#757575" />*/}
                                </View>
                                <View style={{flex:1,flexDirection:'column'}}>
                                    <TextInput
                                        style={styles.input}
                                        mode="outlined"
                                        label='Last Name'
                                        value={this.state.lastName}
                                        error={errorLastName}
                                        onChangeText={text => this.setState({lastName: text, errorLastName: false})}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.primary,
                                                text: Palette.primary,
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

                            <View style={styles.groupForm}>
                                <View style={styles.iconView}>
                                    <Icon name="business" size={30} color="#757575"/>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    mode="outlined"
                                    label='Company Name'
                                    value={this.state.companyName}
                                    onChangeText={text => this.setState({companyName: text})}
                                    theme={{
                                        colors: {
                                            placeholder: Palette.primary,
                                            text: Palette.primary,
                                            primary: Palette.primary,
                                            underlineColor: 'transparent',
                                            background: '#F2F2F2'
                                        }
                                    }}
                                />
                            </View>

                            <View style={styles.groupForm}>
                                <View style={styles.iconView}>
                                    <Icon name="email" size={30} color="#757575"/>
                                </View>
                                <View style={{flex:1,flexDirection:'column'}}>
                                    <TextInput
                                        style={styles.input}
                                        mode="outlined"
                                        label='Email'
                                        keyboardType="email-address"
                                        textContentType="emailAddress"
                                        value={this.state.email}
                                        error={errorEmail}
                                        onChangeText={text => this.setState({email: text,errorEmail:false})}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.primary,
                                                text: Palette.primary,
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

                            <View style={styles.groupForm}>
                                <View style={styles.iconView}>
                                    <Icon name="lock" size={30} color="#757575"/>
                                </View>
                                <View style={{flex:1,flexDirection:'column'}}>
                                    <TextInput
                                        style={styles.input}
                                        mode="outlined"
                                        label='Password'
                                        secureTextEntry={true}
                                        value={this.state.password}
                                        error={errorPassword}
                                        onChangeText={password => this.setState({password:password,errorPassword:false})}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.primary,
                                                text: Palette.primary,
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

                                </View>

                            </View>

                            <View style={styles.groupForm}>
                                <View style={styles.iconView}>
                                    <Icon name="lock" size={30} color="#757575"/>
                                </View>
                                <TextInput
                                    style={styles.input}
                                    mode="outlined"
                                    label='Confirm Password'
                                    secureTextEntry={true}
                                    value={this.state.confirmPassword}
                                    onChangeText={confirmPassword => this.setState({confirmPassword:confirmPassword})}
                                    theme={{
                                        colors: {
                                            placeholder: Palette.primary,
                                            text: Palette.primary,
                                            primary: Palette.primary,
                                            underlineColor: 'transparent',
                                            background: '#F2F2F2'
                                        }
                                    }}
                                />
                            </View>

                            <View style={styles.groupForm}>
                                <Checkbox
                                    color={'#2196F3'}
                                    status={checked ? 'checked' : 'unchecked'}
                                    error={error}
                                    onPress={() => {
                                        this.setState({checked: !checked,error:error});
                                    }}/>
                                <TouchableOpacity onPress={() => {
                                    Linking.openURL('https://alte.io/')
                                }}>
                                    <Paragraph>Accept terms and conditions</Paragraph>
                                </TouchableOpacity>
                            </View>
                            <View style={styles.groupForm}>
                                <Button mode="contained"
                                        onPress={() => {
                                            this.registerUser();
                                        }}
                                >
                                    Register
                                </Button>
                            </View>
                            <View style={styles.signUpTextCont}>
                                <Text style={styles.signUpText}>Already have an account? </Text>
                                <TouchableOpacity onPress={() => navigate('Login')}>
                                    <Text style={styles.signUpButton}>Login</Text>
                                </TouchableOpacity>
                            </View>

                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}

