import {StyleSheet} from 'react-native';

export default StyleSheet.create({
    title: {
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    titleLeft: {
        marginLeft: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleRight: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    titleMoney: {
        color: '#42B72A',
        fontSize: 20,
    },
    titlePublishedLabel: {
        borderColor: '#5cb85c',
        color: '#fff',
        borderRadius: 50,
        fontSize: 12,
        justifyContent: 'flex-end',
        backgroundColor: '#5cb85c'
    },

    titleDraftLabel: {
        borderColor: '#5cb85c',
        color: '#fff',
        borderRadius: 50,
        fontSize: 12,
        justifyContent: 'flex-end',
        backgroundColor: '#f0ad4e'

    },

    titleButton: {
        marginRight: 15,
        marginLeft: 15,
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 5,
    },
    /**Metricas */
    colorIcon: {
        color: '#5cb85c'
    },

    fontSizeTitle: {
        fontSize: 16
    },
    fontSizeDescription: {
        fontSize: 14
    },

    detailTitle: {
        fontSize: 14
    },
    detailDescription: {
        color: '#696969',
        marginTop: 0
    },
    detailIcon: {
        fontSize: 16,
        marginTop: 5,
        color: '#5cb85c'
    },
    detailView: {
        flexDirection: 'row',
        justifyContent: 'flex-start',
        marginTop: 5

    },
    detailMarginRigth: {
        marginRight: 10
    },
    detailMarginLeft: {
        marginLeft: 10
    },
    detailMarginTop: {
        marginTop: 5
    },
    detailBorderColor: {
        paddingBottom: 10,
        paddingLeft: 10,
        borderWidth: 2,
        borderRadius: 4,
        borderColor: '#ddd',
        shadowColor: '#000',

    }
});