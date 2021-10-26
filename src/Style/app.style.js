import {
    StyleSheet,
    Platform,
    Dimensions,
} from 'react-native';
import {Palette} from './app.theme.js';

const {width: WIDTH} = Dimensions.get('window');

export const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 15,
    },
    containerFlat: {
        flex: 1,
        padding: 15,
        // backgroundColor: Palette.gray,
    },
    imageStartScreen: {
        height: '100%',
    },
    imageStartScreen2: {
        resizeMode: 'cover'
    },
    formControl: {
        marginLeft: 10,
        marginRight: 10,
        flex: 1,
        height: 50,
        backgroundColor: "transparent"
    },
    formDatePicker: {
        width: "100%",
        marginBottom: 10,
        marginTop: 10
    },
    formLabel: {
        marginTop: 5,
        marginLeft: 10,
        color: Palette.dark,
        fontWeight: 'bold'
    },
    formRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 0,

        marginVertical: 5,
    },
    formText:{
        paddingTop: 5
    },
    groupRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 8,
        justifyContent: 'space-between',
        paddingRight: 10,
    },
    card: {
        marginBottom: 15,
        borderRadius: 12,
    },
    title: {
        marginBottom: 10,
        marginTop: 5,
    },
    subheading: {
        marginBottom: 10,
    },
    paragraph: {
        marginBottom: 5
    },


    borderContainer: {
        borderRadius: 4,
        borderWidth: 1,
        padding: 10,
    },
    divideForm: {
        marginTop: 8,
    },
    dividePicker: {
        marginBottom: 10,
    },
    questionContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    questionButton: {
        flexDirection: 'row',
        paddingVertical: 8,
        // alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: 10,
    },
    titleInput: {
        fontSize: 13,
        color: '#003A6F',
        fontWeight: 'bold'
    },
    formColumn: {
        flexDirection: "column",
    },
    formButton: {
        marginTop: 180,

    },
    formBottomButton: {
        bottom: 0,
        padding: 15,
        paddingTop: 0,
        width: '100%',
    },
    buttonCancelHeaderRight: {
        alignItems: "center",
        backgroundColor: Palette.primary,
        padding: 10,
        marginRight: 10,
    },
    textLightButton: {
        color: Palette.light,
        fontSize: 16,
    },

    radioButtonColumn: {
        flexDirection: "column",
        alignItems: "center",
        marginHorizontal: 10
    },
    screenButton: {
        padding: 8,
        borderRadius: 12
    }

});

export const styleTitleInfo = StyleSheet.create({
    buttonAction: {
        paddingHorizontal: 15,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    containerFlat: {
        flex: 1,
        paddingVertical: 15,
        // backgroundColor: Palette.gray,
    },
    avatarIcon: {
        marginTop: 14,
        marginRight: 20,
        ...Platform.select({
            ios: {
                shadowColor: '#000',
                shadowOffset: {width: 0, height: 2},
                shadowOpacity: 0.2,
            },
            android: {
                elevation: 2

            },
        }),
        backgroundColor: "white",
    },
    containerRow: {
        flexGrow: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start' // if you want to fill rows left to right
    },
    itemRow: {
        flex: 1,
    },
    sliderWidth: WIDTH,
    itemWidth: WIDTH - 30,
});

export const stylesRNPicker = StyleSheet.create({
    searchBarContainerStyle: {
        marginBottom: 10,
        flexDirection: "row",
        height: 40,
        shadowOpacity: 1.0,
        shadowRadius: 5,
        shadowOffset: {
            width: 1,
            height: 1
        },
        backgroundColor: "rgba(255,255,255,1)",
        shadowColor: "#d3d3d3",
        borderRadius: 10,
        elevation: 3,
        marginLeft: 10,
        marginRight: 10
    },

    selectLabelTextStyle: {
        color: Palette.dark,
        textAlign: "center",
        width: "99%",
        padding: 10,
        flexDirection: "row",
        fontWeight: 'bold',
        fontSize: 16,
    },
    placeHolderTextStyle: {
        color: Palette.darkGray,
        padding: 10,
        textAlign: "center",
        width: "99%",
        flexDirection: "row",
        opacity: 0.5,
        fontSize: 16,
    },
    dropDownImageStyle: {
        // width: 10,
        // height: 10,
        // alignSelf: "center",
        display: 'none'
    },
    listTextViewStyle: {
        backgroundColor: Palette.light,
        color: Palette.primary,
        borderWidth: 0.5,
        marginVertical: 2,
        flex: 1,
        borderRadius: 10,
        padding: 5,
        marginHorizontal: 15,
        textAlign: "center"
    },
    pickerStyle: {
        flexDirection: "row",
        borderWidth: 1,
        marginVertical: 10,
        borderColor: Palette.darkGray,
        opacity: 0.5,
        marginRight: -5,
        textAlign: 'center',
    }
});
