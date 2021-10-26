import React, {Component} from 'react';
import {View, ScrollView, Text, TouchableOpacity, SafeAreaView, Image, ImageBackground,} from 'react-native';
import {Button, TextInput, Title, Appbar} from 'react-native-paper';
import Icon  from 'react-native-vector-icons/MaterialIcons';
import styles from './forgotPassword.style';
import {Palette} from "src/Style/app.theme";
import {AuthService} from "src/services/index";
import stylesCard from '../auth/login.style'
import logo from 'src/images/email.png';

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
export default class ForgotPassword extends Component {

    state = {
        email: '',
        messageResult:'',
        error:false,
        success:false,

    };

    async resetPassword(){
        const {email} = this.state;

        AuthService.resetPassword(email).then(async(response)=>{
                this.setState({messageResult:response.results,success:true});
            }
        , error => {
            this.setState({messageResult:error.errors.email,error:true});
            console.warn('resetPassword error', error);
            if(error.status === 401)
                alert(error.message);
        });
    }

    render() {
        const {error} = this.state;

        return (
            <BackgroundImage style={{flex: 1,backgroundColor:'#fff'}}>
                  <TouchableOpacity   onPress={() => this.props.navigation.navigate('Login')}>
                                <View style={{flexDirection: 'row', paddingTop: 60 }}>

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
                <ScrollView contentContainerStyle={{flexGrow: 0.5, justifyContent: 'center'}} keyboardShouldPersistTaps="handled">
                            
                                <View style={styles.container}>
                                      

                                        <View style={styles.styleImage}>
                                            <Image source={logo} style={styles.logo}/>
                                        </View>

                                        <Title style={styles.titleRegister}>
                                           Check your mail
                                        </Title>

                                        <Title style={styles.titleSecond}>
                                            We will send you a link to your email so you can change the password.
                                        </Title>
                                    

                                    {
                                        (this.state.error)?
                                            <Title style={{fontSize: 15,color:'#BB3C3F'}}>
                                                {this.state.messageResult}
                                            </Title>:null
                                    }
                                    {
                                        (this.state.success)?
                                            <Title style={{fontSize: 15,color:'#007C32'}}>
                                                {this.state.messageResult}
                                            </Title>:null
                                    }

                                    <View style={{paddingTop: 20}}>
                                        <Text style={{fontWeight: 'bold', color: '#000'}}>
                                            Email:
                                        </Text>
                                    </View>

                                    <View style={styles.groupForm}>
                                        
                                        <TextInput
                                            style={styles.input}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            textContentType="emailAddress"
                                            value={this.state.email}
                                            error={error}
                                            onChangeText={text => this.setState({email: text, error: false,success:false})}
                                            backgroundColor="#fff"
                                            mode="flat"
                                            underlineColor="none"
                                            placeholder="mandy_music@gmail.com"
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
                                
                                    <View style={{paddingTop: 30}}>
                                        <Button
                                            labelStyle={{fontWeight: 'bold'}}
                                            style={styles.groupCardButton}
                                            mode="contained"
                                            uppercase={false}
                                            color={Palette.primary}
                                            onPress={() => {
                                                console.warn(this.state.email);
                                                this.resetPassword();
                                            }}>
                                            Send Password Reset Link
                                        </Button>
                                    </View>
                                </View>
                           
                </ScrollView>
            </BackgroundImage>
        );
    }
}