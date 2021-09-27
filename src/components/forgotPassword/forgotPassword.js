import React, {Component} from 'react';
import {View, ScrollView, Text, TouchableOpacity, SafeAreaView} from 'react-native';
import {Button, TextInput, Title} from 'react-native-paper';
import Icon  from 'react-native-vector-icons/MaterialIcons';
import styles from './forgotPassword.style';
import {Palette} from "src/Style/app.theme";
import {AuthService} from "src/services/index"

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
            <SafeAreaView style={{flex: 1}}>
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}} keyboardShouldPersistTaps="handled">

                    <View style={styles.container}>
                        <Title style={styles.titleRegister}>
                            Forgot Password
                        </Title>
                        <View style={styles.groupForm}>
                            <Title style={styles.titleSecond}>
                                We will send you a link to your email so you can change the password.
                            </Title>
                        </View>

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
                        <View style={styles.groupForm}>

                            <View style={styles.iconView}>
                                <Icon name="email" size={30} color="#757575"/>
                            </View>
                            <TextInput
                                style={styles.input}
                                keyboardType="email-address"
                                textContentType="emailAddress"
                                value={this.state.email}
                                error={error}
                                onChangeText={text => this.setState({email: text, error: false,success:false})}
                                label="Email"
                                mode="outlined"
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
                            <Button
                                style={{margin: 1}}
                                mode="contained"
                                onPress={() => {
                                    console.warn(this.state.email);
                                    this.resetPassword();
                                }}>
                                Send Password Reset Link
                            </Button>
                        </View>
                        <View style={styles.forgotTextCont}>
                            <Text style={styles.signUpText}>Go back and continue with </Text>
                            <TouchableOpacity onPress={() => this.props.navigation.navigate('Login')}>
                                <Text style={styles.signUpButton}>Sign in</Text>
                            </TouchableOpacity>
                        </View>

                    </View>

                </ScrollView>
            </SafeAreaView>
        );
    }
}