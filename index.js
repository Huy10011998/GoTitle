/**
 * @format
 */
import "react-native-gesture-handler";
import React from 'react';
import {AppRegistry} from 'react-native';
import {Provider as PaperProvider} from 'react-native-paper';
import AppComponent from './App';
import {name as appName} from './app.json';
import {Theme} from 'src/Style/app.theme';

const App = () => (
    <PaperProvider theme={ Theme }>
        <AppComponent />
    </PaperProvider>
);

AppRegistry.registerComponent(appName, () => App);