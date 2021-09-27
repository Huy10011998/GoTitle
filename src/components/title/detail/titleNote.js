import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import {
    Title,
    withTheme,
    Card,
    TextInput,
} from 'react-native-paper';

import { styles} from 'src/Style/app.style';


class TitleNote extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.navigation.getParam('data'),
        }
    }

    static navigationOptions = {
        title: 'Detail',
        headerStyle: {
            backgroundColor: '#006eaf',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
            fontWeight: 'bold',
        },
    };

    render() {
        const item = this.state.data;
        return (
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
                <View style={styles.containerFlat}>
                    <Title style={styles.title}>Notes</Title>
                    <Card style={ styles.card }>
                        <Card.Content>
                            <TextInput
                                multiline={true}
                                numberOfLines={5}
                                disabled={true}
                                value={item.note}
                            />
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        );
    }
}

export default withTheme(TitleNote);