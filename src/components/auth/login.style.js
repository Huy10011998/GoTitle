import {
    StyleSheet,
    Dimensions,
} from 'react-native';

import {Palette} from "src/Style/app.theme";
const { width: WIDTH } = Dimensions.get('window');
const { height: HEIGHT} = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        flex: 1,
        resizeMode: 'contain',
        width: '50%',
    },
    input: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        height: 50
    },

    loginButton: {
        marginTop: 10,
        borderRadius: 18,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    signUpTextCont: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 16,
    },
    styleText: {
        fontSize: 28,
        fontWeight: 'bold'
    },
    styleButton: {
        justifyContent:'center',
        alignItems: 'center',
        height: HEIGHT * 0.35
    },
    styleTextLogin: {
        color: "#4169e1", 
        fontWeight: '700'
    },
    iconTextInput: {
        flex: 1,
        flexDirection: 'row',
        marginTop: 10
    },
    iconView: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    textforgotContainer: {
        justifyContent: 'center',
        alignItems: 'flex-end',
        paddingTop: 10
    },
    borderStyle: {
        flexDirection: 'row',
        marginLeft: 10,
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.primary
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    },
});