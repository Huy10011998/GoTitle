import React, { Component } from 'react';
import { View, Text } from 'react-native';
import { Portal, Dialog, Button } from 'react-native-paper';

import Step from './step';

class Wizard extends Component {
    static Step = Step;

    constructor(props) {
        super(props);
    };

    state = {
        index: 0,

        title: {
            ...this.props.initialValues,
        },

        routeKey: { ...this.props.routeKey },
        dialog: false,
    };

    _nextStep = () => {
        if (this.state.index !== this.props.children.length - 1) {
            this.setState(prevState => ({
                index: prevState.index + 1,
            }));
        }
    };

    _prevStep = () => {
        if (this.state.index !== 0) {
            this.setState(prevState => ({
                index: prevState.index - 1,
            }));
        }
    };

    _onChangeValue = (name, value) => {
        this.setState(prevState => ({
            title: {
                ...prevState.title,
                [name]: value,
            },
        }));
    };

    _onSubmit = () => {
        this._hideDialog();
        { this.props.props.navigation.navigate('' + this.state.routeKey.routeKey + '', { item: this.state.title }) }
    };

    _hideDialog = () => this.setState({ dialog: false });

    _openDialog = () => this.setState({ dialog: true });

    render() {
        return (
            <View style={{ flex: 1 }}>
                <View style={{ height: '100%' }}>
                    {React.Children.map(this.props.children, (el, index) => {
                        if (index === this.state.index) {
                            return React.cloneElement(el, {
                                currentIndex: this.state.index,
                                nextStep: this._nextStep,
                                prevStep: this._prevStep,
                                isLast: this.state.index === this.props.children.length - 1,
                                onChangeValue: this._onChangeValue,
                                title: this.state.title,
                                onSubmit: this._openDialog,
                            });
                        }
                        return null;
                    })}
                </View>
                <Portal>
                    <Dialog visible={this.state.dialog} onDismiss={this._hideDialog}>
                        <Dialog.Title>Confirmation</Dialog.Title>
                        <Dialog.Content>
                            <Text>Are you sure to publish information?</Text>
                        </Dialog.Content>
                        <Dialog.Actions>
                            <Button onPress={this._hideDialog}>Cancel</Button>
                            <Button onPress={this._onSubmit}>Yes</Button>
                        </Dialog.Actions>
                    </Dialog>
                </Portal>
            </View>
        );
    }
}

export default Wizard;