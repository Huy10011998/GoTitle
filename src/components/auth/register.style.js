import {
    StyleSheet,
    Dimensions,
} from 'react-native';
import {Palette} from "src/Style/app.theme";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 45,
        //flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
    },
    groupForm: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 4,
        paddingHorizontal: 16,

    },
    input: {
        flex: 1,
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
});