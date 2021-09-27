
/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { View, Dimensions } from 'react-native';
import { Divider, Text, Button, List } from 'react-native-paper';
import styles from './title.style';

export default class Title extends Component {
    constructor (props) {
        super(props);

    }

    static navigationOptions = {
        headerShown: false
    };

    render() {
        const { data } = this.props;
        const { width: WIDTH } = Dimensions.get('window');
        return (
            <View>
                <Divider/>
                    <List.Section>
                        <List.Item
                            title={
                            <Text>
                                {data.dateEffective.format}
                            </Text> }
                            description={ data.location.name }
                            right={() =>
                            <View style={{ width: (WIDTH) * 0.20 }}>
                                <View>
                                    <Text style={styles.titleMoney}>{ data.price }
                                    </Text>
                                </View>
                                <View>
                                    <Text>{data.state}</Text>
                                </View>
                            </View> }
                        />
                    </List.Section>
            </View>
        );
    }
}
