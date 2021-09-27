import React, {Component} from 'react';
import {
    StyleSheet,
    ScrollView,
    View
} from 'react-native';
import {DrawerItems} from 'react-navigation-drawer';
import { useSeafeArea } from 'react-native-safe-area-context';
import {Button} from 'react-native-paper';
import AsyncStorage from "@react-native-community/async-storage";
import {getConnection} from 'typeorm';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 30
    },
});

class CustomDrawerContentComponent extends Component {
    constructor(props) {
        super(props);
    }

    logout() {
        AsyncStorage.removeItem('user-token').then(async () => {
            if (getConnection().isConnected)
                await getConnection().close();
            this.props.navigation.navigate("AuthNav");
        }, err => console.error(err));
    }

    render() {
        const {...restProps} = this.props;
        const {navigate} = this.props.navigation;

        return (
            <ScrollView>
                <View style={ styles.container } forceInset={{top: 'always', horizontal: 'never'}}>
                    <DrawerItems {...restProps} />

                    <Button icon='exit-to-app' mode='text'
                            visible="false"
                            onPress={() => {
                                this.logout();
                            }}
                    >
                        Sign Out
                    </Button>

                </View>
            </ScrollView>
        );
    }
}

export default CustomDrawerContentComponent;