import {
    StyleSheet,
    Dimensions,
} from 'react-native';

export default StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    cameraContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    iconContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        marginHorizontal: 15,
        paddingVertical: 10,
    },
    actions: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '70%',
    },
    previewContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    previewActions: {
        position: 'absolute',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '35%',
        paddingBottom: 50,
    },
    previewImage: {
        marginTop: 30,
        height: Dimensions.get('window').height,
        width: Dimensions.get('window').width,
    },
});