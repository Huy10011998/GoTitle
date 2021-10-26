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
    Platform,
    Linking,
    Alert
} from "react-native";
import {TextInput, Button} from 'react-native-paper';
import Icon  from 'react-native-vector-icons/Octicons';

import {AuthService} from "src/services/index";

import styles from './login.style.js';
import logo from 'src/images/logo.png';
import {Palette} from 'src/Style/app.theme';
import AsyncStorage from "@react-native-community/async-storage";
import {getManager, getConnection} from 'typeorm';
import {OauthToken,User} from 'src/entities/index';
import VersionNumber from 'react-native-version-number';

import photoStarScreen from '../../images/bg.jpg'

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
export default class Login extends Component {

    constructor(props) {
        super(props);
        this.manager = getManager();
        this.connection = getConnection();
        this.state = {
            secureTextEntry: true,
            iconName: "eye"
        }
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
        }],
        isSecureEntry: true
    };

    onIconPress = () => {
        let iconName = (this.state.secureTextEntry) ? "eye-closed" : "eye";
        this.setState({
            secureTextEntry: !this.state.secureTextEntry,
            iconName: iconName
        });
    }

    componentDidMount() {
        console.log("log version",VersionNumber.appVersion)
        this.checkForceUpdate()
    }
    checkForceUpdate = ()=>{
        let storeVersion = "1.1.3"
        let appVersion = VersionNumber.appVersion
        if(Number(appVersion.replace('.', '')) < Number(storeVersion.replace('.', ''))){
            console.log("force update")
            Alert.alert('Notification', 'Is there a new version you want to update?', [
                {
                  text: 'OK',
                  onPress: () => {
                    Linking.openURL(
                        'https://gotitle.co/'
                      );
                  },
                  style: 'destructive',
                },
                {cancelable: false, text: 'Cancel'},
              ]);
        }
    }
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
            // <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                 <BackgroundImage>
                    <KeyboardAvoidingView style={{flex: 1, flexDirection: 'column', justifyContent: 'center'}}
                                        behavior={Platform.OS == "ios" ? "padding" : null}
                                        enabled={Platform.OS == "ios" ? true : false} keyboardVerticalOffset={0}>
                        <ScrollView contentContainerStyle={{flexGrow: 0.5, justifyContent: 'center'}}
                                    keyboardShouldPersistTaps="handled">
                            
                                    <View style={{flex: 1, marginHorizontal: 30}}>

                                        <View style={styles.container}>
                                            <Image source={logo} style={styles.logo}/>
                                        </View>

                                        <View>
                                            <View style={styles.iconTextInput}>
                                                
                                                <View style={styles.iconView}>
                                                    <Icon name="person" size={25} color={Palette.graytextinput}/>
                                                </View >

                                                <View style={styles.borderStyle}>
                                                    <TextInput
                                                        style={styles.input}
                                                        autoCapitalize="none"
                                                        backgroundColor="#fff"
                                                        underlineColor="none"
                                                        placeholder="Email"
                                                        mode="flat"
                                                        keyboardType="email-address"
                                                        textContentType="emailAddress"
                                                        value={this.state.email}
                                                        error={error}
                                                        onChangeText={text => this.setState({email: text, error: false})}
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
                                            <View style={styles.iconTextInput}>

                                                <View style={styles.iconView}>
                                                    <Icon name="lock" size={25} color={Palette.graytextinput}/>
                                                </View>
                                                <View style={styles.borderStyle}>
                                                    <TextInput 
                                                        {...this.props}
                                                        style={styles.input}
                                                        autoCapitalize="none"
                                                        mode="flat"
                                                        backgroundColor="#fff"
                                                        placeholder="Password"
                                                        secureTextEntry={this.state.secureTextEntry}
                                                        underlineColor="none"
                                                        // right={<IconInPut />} 
                                                        error={error}
                                                        value={this.state.password}
                                                        onChangeText={password => this.setState({password: password, error: false})}
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
                                                     <View style={{justifyContent: 'center', alignItems: 'center', marginRight :10}}>
                                                        <TouchableOpacity onPress={this.onIconPress}>
                                                            <Icon name={this.state.iconName} size={25} color={Palette.graytextinput}/>
                                                        </TouchableOpacity>
                                                    </View> 
                                                </View>
                                              
                                            </View>

                                            <View style={styles.textforgotContainer}>
                                                    <TouchableOpacity onPress={() => navigate('ForgotPassword', {name: 'Jane'})}>
                                                        <Text style={{fontWeight: 'bold'}}>
                                                                FORGOT?
                                                        </Text>
                                                    </TouchableOpacity>            
                                            </View>

                                            <View style={{paddingTop: 20}}>
                                                <TouchableOpacity onPress={() => {this.signIn();}}>
                                                    <Button style={styles.loginButton} mode="contained"
                                                            labelStyle={{fontWeight: 'bold'}}
                                                            disabled={checked}
                                                            uppercase={false}
                                                            color={Palette.primary}>
                                                        Login
                                                    </Button>
                                                </TouchableOpacity>
                                            </View>

                                            <View>
                                                <TouchableOpacity onPress={() => navigate('SignUp', {name: 'Test'})}>
                                                    <Button style={styles.loginButton} mode="contained"
                                                            disabled={checked}
                                                            labelStyle={{fontWeight: 'bold'}}
                                                            uppercase={false}
                                                            color={Palette.black}>
                                                        Create a new account
                                                    </Button>
                                                </TouchableOpacity>
                                            </View>

                                        </View>

                                    </View>                      
                        </ScrollView>
                    </KeyboardAvoidingView>
                </BackgroundImage>
            // </SafeAreaView>                  
        );
    }
}

const IconInPut = () => {
    return (
        <View>
            <TextInput.Icon icon="eye" />
        </View>
    )
}