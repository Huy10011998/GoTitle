import React, {Fragment, Component} from 'react';
import { StyleSheet, SafeAreaView, Dimensions} from 'react-native';
import {Palette} from 'src/Style/app.theme';
import {Button, Dialog, Portal,Paragraph} from 'react-native-paper';



export default class ModalSave extends Component {
    static defaultProps = {
        onDismiss: () => {
        },
        onSave: () => {
        },
        onNoSave: () =>{

        }
    };

    constructor(props) {
        super(props);
        this.state = {
            visible: false
        };
    };


    render() {
            return (
                <SafeAreaView>
                    <Portal>
                        <Dialog
                            style={styles.dialogFlat}
                            visible={this.props.visible}
                            dismissable={false}
                        >

                            <Dialog.Content>
                                <Paragraph style={styles.text}>Save changes before closing?</Paragraph>
                            </Dialog.Content>

                            <Dialog.Actions>
                                <Button onPress={()=>{ this.props.onSave() }}>Save</Button>
                                <Button onPress={()=>{ this.props.onNoSave() }}>Don't Save</Button>
                                <Button onPress={()=>{ this.props.onDismiss() }}>Cancel</Button>
                            </Dialog.Actions>

                    </Dialog>
                </Portal>
            </SafeAreaView>
        );
    }
};

const styles = StyleSheet.create({
    dialogFlat: {
        marginHorizontal: 10,
        backgroundColor: Palette.gray,
        maxHeight: 0.8 * Dimensions.get('window').height
    },
    text: {
        fontSize: 16,
        marginVertical:10
    }
});