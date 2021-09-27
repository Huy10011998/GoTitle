import {
    StyleSheet,
    Dimensions,
} from 'react-native';
import {Palette} from "src/Style/app.theme";

const {width: WIDTH} = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    groupForm: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,

    },
    logo: {
        flex: 1,
        resizeMode: 'contain',
        width: 200,
        height: null,
    },
    input: {
        flex: 1,
        width: WIDTH - 55,
        // marginHorizontal: 25,
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
        padding: 10,
        color: Palette.primary,
        fontSize: 40,
        fontWeight: '700',
    },
    titleSecond: {
        textAlign: 'center',
        fontSize: 17,
        padding: 10,
        justifyContent: 'center',
        color: '#000000'
    }
});