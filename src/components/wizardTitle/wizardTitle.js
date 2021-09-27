import React, { Component } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

import Wizard from './wizard';
import BasicInfo from 'src/components/titleForm/basicInfo/basicInfo';
import Description from "../titleForm/description/description";
import ChainTitle from '../titleForm/chainTitle/chainTitle';
import Mortgage from '../titleForm/mortgage/mortgage';
import Liens from '../titleForm/lien/liens';
import Easement from '../titleForm/easement/easement';
import Covenant from "../titleForm/covenant/covenant";
import Note from "../titleForm/note/note";
import UploadCopy from "../titleForm/publish/uploadCopy";
import dataTitle from "src/dataSample/dataTitle.json";

export default class WizardTitle extends Component {
    constructor(props) {
        super(props);
    };

    static navigationOptions = ({ navigation }) => {
        return {
            title: navigation.getParam('dataTitle') ? 'Edit Title' : 'Add Title',
            headerStyle: {
                backgroundColor: '#006eaf',
            },
            headerTintColor: '#fff',
            headerTitleStyle: {
                fontWeight: 'bold',
            },
        }
    };

    render() {
        const { navigation } = this.props;
        var title = navigation.getParam('dataTitle') ? navigation.getParam('dataTitle') : dataTitle;
        var routeKey = navigation.getParam('routeKey') ? navigation.getParam('routeKey') : 'Home';

        return (
            <View style={styles.root}>
                <Wizard
                    initialValues={title}
                    routeKey={{routeKey}}
                    props={this.props}
                >
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <BasicInfo
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <Description
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <ChainTitle
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <Mortgage
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <Liens
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <Easement
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <Covenant
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <Note
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                    <Wizard.Step>
                        {({ onChangeValue, title }) => (
                            <UploadCopy
                                onChangeValue={onChangeValue}
                                title={title}
                            />
                        )}
                    </Wizard.Step>
                </Wizard>
            </View>
        );
    }
}
const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});