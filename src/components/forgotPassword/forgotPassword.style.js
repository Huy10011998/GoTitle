import {
    StyleSheet,
    Dimensions,
} from 'react-native';
import {Palette} from "src/Style/app.theme";

const {width: WIDTH} = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        // alignItems: 'center',
        paddingHorizontal: 30,
    },
    groupForm: {
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.primary
    },
    groupButton: {
        paddingVertical: 8,
    },
    groupCardButton: {
        borderRadius: 18, 
        borderWidth: 1, 
        height: 50,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        height: 50
        // width: WIDTH - 55,
        // marginRight: 20,
    },
    loginButtonCont: {
        paddingTop: 10,
    },
    loginButton: {
        marginTop: 16,
    },
    rowChecked: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginVertical: 8,
        marginHorizontal: 16,
    },
    signUpTextCont: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
        marginBottom: 16,
    },
    signUpText: {
        marginTop: 25,
        fontSize: 16,
    },
    signUpButton: {
        color: Palette.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    forgotTextCont: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    iconView: {
        width: '10%',
    },
    titleRegister: {
       textAlign: 'center',
        padding: 10,
        color: Palette.dark,
        fontSize: 30,
        fontWeight: '700',
    },
    titleSecond: {
        textAlign: 'center',
        fontSize: 17,
        paddingTop: 20,
        justifyContent: 'center',
        color: Palette.graytextinput
    },
    logo: {
        flex: 1,
        resizeMode: 'contain',
        width: '30%',
    },
    styleImage: {
        alignItems: 'center',     
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    },
});