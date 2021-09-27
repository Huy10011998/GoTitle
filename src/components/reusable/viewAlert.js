
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, StyleSheet} from 'react-native';
import { Text } from 'react-native-paper';
import Icon  from 'react-native-vector-icons/MaterialIcons';

export default class viewAlert extends Component {
    constructor (props) {
        super(props);

    }
    render() {
        const { data } = this.props;
        return (
            <View style={{flex:1}}>
                <View style={[ stylesAlert.subContainer,
                    {backgroundColor: data.backgroundStyle}]}>
                    <Icon style={{marginRight: 10}}
                          name={data.icon.name}
                          size={data.icon.size}
                          color={data.icon.color}/>
                    <Text style={{color: data.colorStyle,
                        alignItems: 'center',
                        fontSize: data.text.size,
                        flex: 1}}>
                        {data.text.name}
                    </Text>
                </View>
            </View>
        );
    }
}

const stylesAlert = StyleSheet.create({
    container: {
        alignItems: 'center'
    },
    subContainer: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderColor: '#d9edf7',
        borderWidth: 1,
        borderRadius: 4,
        padding: 5
    }

});
