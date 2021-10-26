import {
    StyleSheet,
    Dimensions,
} from 'react-native';
import {Palette} from "src/Style/app.theme";

export default StyleSheet.create({
    container: {
        flex: 1,
        marginVertical: 10,
        paddingHorizontal: 30,
        //flexDirection: 'column',
    },
    titleInput: {
        paddingTop: 10,
    },
    groupForm: {
        marginTop: 10,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Palette.primary
    },
    groupButtonRegister: {
        borderRadius: 12,
        width: '100%',
        height: 50,
    },
    groupButton: {
        borderRadius: 12, 
        borderWidth: 1, 
        height: 50,
        // marginHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center'
    },
    input: {
        flex: 1,
        marginLeft: 10,
        marginRight: 10,
        height: 50
    },
    iconView: {
        width: '10%',
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
    styleTitle: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    textAccept: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 10
    },
    footer:{
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 20
    },
    image: {
        justifyContent: 'center',
        alignItems: 'center',
        width: 50,
        height: 50,
        backgroundColor: '#7293BC',
        borderRadius: 64,
        marginLeft: 10
    },
    logo: {
        resizeMode: 'contain',
        height: 25,
        width: 25,
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    },
    titleRegister: {
        textAlign: 'center',
        color: Palette.dark,
        fontSize: 30,
        fontWeight: '700',
     },
});