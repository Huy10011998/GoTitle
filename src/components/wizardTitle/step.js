import React, {Component} from 'react';
import {View, StyleSheet} from 'react-native';

import {Button} from 'react-native-paper';

class Step extends Component {
    state = {};

    render() {
        return (
            <View style={styles.root}>
                {this.props.children({
                    onChangeValue: this.props.onChangeValue,
                        title: this.props.title,
                })}
                <View style={styles.buttonContainer}>
                    <View style={styles.buttonWrapper}>
                        <Button
                            mode="contained"
                            color={'#006eaf'}
                            disabled={this.props.currentIndex === 0}
                            onPress={this.props.prevStep}
                            style={styles.button}
                        >
                            Prev
                        </Button>
                    </View>
                    {this.props.isLast ? (
                    <View style={styles.buttonWrapper}>
                        <Button
                        mode="contained"
                        color={'#006eaf'}
                        onPress={this.props.onSubmit}
                        style={styles.button}
                        >
                        Publish
                        </Button>
                    </View>
                    ) : (
                    <View style={styles.buttonWrapper}>
                        <Button
                        mode="contained"
                        color={'#006eaf'}
                        onPress={this.props.nextStep}
                        style={styles.button}
                        >
                        Next
                        </Button>
                    </View>
                    )}
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    buttonContainer: {
        flexDirection: 'row',
        height: 60,
    },
    buttonWrapper: {
        width: '50%',
        alignItems: 'center',
        justifyContent: 'space-around',
    },
});

export default Step;