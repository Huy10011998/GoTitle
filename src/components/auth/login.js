import React, {Component} from 'react';
import {
    ScrollView,
    Text,
    View,
    ImageBackground,
    Image,
    TouchableOpacity,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform
} from "react-native";
import {TextInput, Button, Checkbox, Paragraph} from 'react-native-paper';

import {onSignIn, AuthService, TitleService, DeedTypeService} from "src/services/index";

import styles from './login.style.js';
import logo from 'src/images/logo.png';
import {Palette} from 'src/Style/app.theme';
import AsyncStorage from "@react-native-community/async-storage";
import {getManager, getConnection} from 'typeorm';
import {OauthToken,User} from 'src/entities/index';

export default class Login extends Component {

    constructor(props) {
        super(props);
        this.manager = getManager();
        this.connection = getConnection();
    }

    static navigationOptions = {
        headerShown: false
    };

    state = {
        email: '',
        password: '',
        checked: false,
        error: false,
        userOwner:[{
            apiId:'',
            name:'',
            lastName:'',
            email:''
        }]
    };

    async signIn() {
        const {email, password} = this.state;
        this.setState({checked: true});

        if (!this.connection.isConnected)
            await this.connection.connect();

        AuthService.getToken(email, password).then(async (oauthToken) => {
            await this.connection
                .createQueryBuilder()
                .delete()
                .from(OauthToken)
                .where("username = :username", {username: email})
                .execute();
            let date = new Date();
            oauthToken.username = email;
            oauthToken.expired_at = new Date(date.getTime() + Number(oauthToken.expires_in) * 1000);
            this.manager.save(OauthToken, oauthToken);
            this.saveToken(oauthToken.access_token);
            AuthService.getUser(oauthToken.access_token).then(async (response) => {
                let user = response.results;
                user.forEach(async (newUser)=>{
                    let newUserSave ={
                        apiId: '',
                        name:'',
                        lastName:'',
                        email:''
                    };
                    const dbUser = await this.manager.findOne(User,{where:{apiId:newUser.id}});
                    if(dbUser !== null && typeof dbUser !== 'undefined'){
                           if(dbUser.apiId === newUser.id){
                               newUserSave ={
                                   id:dbUser.id,
                                   apiId: dbUser.apiId,
                                   name:newUser.name,
                                   lastName:newUser.lastName,
                                   email:newUser.email
                               }
                           }

                    }else {
                        newUserSave ={
                            apiId: newUser.id,
                            name:newUser.name,
                            lastName:newUser.lastName,
                            email:newUser.email
                        };
                    }
                    this.manager.save(User,newUserSave);
                    this.saveUserId(newUser.id);
                });
            }, error => {
                if(error.status === 401 || error.status === 403){
                    AsyncStorage.removeItem('user-token').then(async () => {
                        if (getConnection().isConnected)
                            await getConnection().close();
                        this.props.navigation.navigate("AuthNav");
                    });
                }
                console.warn('Login error', error);
            });

        }, error => {
            this.setState({error: true, checked: false});
            console.warn('Login error', error);
            if (error.status === 401)
                alert(error.message);
        });
    }

    saveToken(token) {
        AsyncStorage.setItem('user-token', token)
            .then(() => {
                this.props.navigation.navigate("AppNav");
            }, err => console.error(err));
    }
    async saveUserId(id){
        await AsyncStorage.setItem('user-id',id.toString())
            .then(() => {
                console.log("login saved");
            }, err => console.error("error",err));
    }


    render() {
        const {checked, error} = this.state;
        const {navigate} = this.props.navigation;
        return (
            <SafeAreaView style={{flex: 1}}>
                <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                      behavior={Platform.OS == "ios" ? "padding" : null}
                                      enabled={Platform.OS == "ios" ? true : false} keyboardVerticalOffset={0}>
                    <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}
                                keyboardShouldPersistTaps="handled">
                        <View style={{flex: 1}}>
                            <View style={[styles.container, {marginTop: 20}]}>
                                <Image source={logo} style={styles.logo}/>
                            </View>
                            <View style={styles.container}>
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        autoCapitalize="none"
                                        mode="outlined"
                                        label='Email'
                                        keyboardType="email-address"
                                        textContentType="emailAddress"
                                        value={this.state.email}
                                        error={error}
                                        onChangeText={text => this.setState({email: text, error: false})}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.primary,
                                                text: Palette.primary,
                                                primary: Palette.primary,
                                                underlineColor: 'transparent',
                                            }
                                        }}
                                    />
                                </View>
                                <View>
                                    <TextInput
                                        style={styles.input}
                                        autoCapitalize="none"
                                        mode="outlined"
                                        label='Password'
                                        error={error}
                                        secureTextEntry={true}
                                        value={this.state.password}
                                        onChangeText={password => this.setState({password: password, error: false})}
                                        theme={{
                                            colors: {
                                                placeholder: Palette.primary,
                                                text: Palette.primary,
                                                primary: Palette.primary,
                                                underlineColor: 'transparent',
                                            }
                                        }}
                                    />
                                </View>

                                <View style={styles.forgotTextCont}>
                                    <Text style={styles.signUpText}>Forgot your password? </Text>
                                    <TouchableOpacity onPress={() => navigate('ForgotPassword', {name: 'Jane'})}>
                                        <Text style={styles.signUpButton}>Click here!</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.loginButtonCont}>
                                    <Button style={styles.loginButton} mode="contained"
                                            disabled={checked}
                                            color={Palette.primary}
                                            onPress={() => {
                                                this.signIn();
                                            }}
                                    >
                                        Login
                                    </Button>
                                </View>
                            </View>
                            <View style={styles.signUpTextCont}>
                                <Text style={styles.signUpText}>Don`t have an account yet? </Text>
                                <TouchableOpacity onPress={() => navigate('SignUp', {name: 'Test'})}>
                                    <Text style={styles.signUpButton}>Sign up now!</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }
}