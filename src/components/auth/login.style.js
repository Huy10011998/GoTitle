import {
    StyleSheet,
    Dimensions,
} from 'react-native';

import {Palette} from "src/Style/app.theme";
const { width: WIDTH } = Dimensions.get('window');

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    logo: {
        flex: 1,
        resizeMode: 'contain',
        width: 200,
    },
    input: {
        width: WIDTH - 55,
        marginHorizontal: 25,
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
        marginTop: 20,
        marginBottom:10,
        fontSize: 16,
    },
    signUpButton: {
        color: Palette.primary,
        fontSize: 16,
        marginBottom:10,
        fontWeight: '700',
    },
    forgotTextCont: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'center',

    },
});