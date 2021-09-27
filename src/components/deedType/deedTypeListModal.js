import React, {Fragment, Component} from 'react';
import {View, TouchableOpacity, StyleSheet, Text, SafeAreaView, SectionList, Dimensions} from 'react-native';
import {Palette} from 'src/Style/app.theme';
import {Button, Dialog, Portal} from 'react-native-paper';

import {getManager, getConnection} from 'typeorm';
import {DeedType} from 'src/entities/DeedType';

export default class DeedTypeListModal extends Component {
    static defaultProps = {
        onDismiss: () => {
        },
        onSelected: () => {
        },
    };

    constructor(props) {
        super(props);
        this.state = {
            open: false,
            masterList: [],
            secondaryList: [],
            visible: false,
            docType: '',
        };
    };

    async loadList(docType) {
        if (!getConnection().isConnected)
            await  getConnection().connect();

        let list = [];
        let masterList = [];
        let secondaryList = [];
        if (docType == 'easement') {
            masterList = await this.manager.find(DeedType, {docType: docType});
            secondaryList = await this.manager.find(DeedType, {docType: 'lease'});
            list = [{
                name: 'Choose Easement',
                data: masterList
            }, {
                name: 'Choose Lease',
                data: secondaryList
            }];
        } else if (docType == 'misc_civil_probate') {
            masterList = await this.manager.query("SELECT * FROM deed_type WHERE docType ='" + docType + "' or docType ='tax'");
            list = [{
                name: '',
                data: masterList
            }, {name: '', data: []}];
        } else {
            masterList = await this.manager.find(DeedType, {scope: 'master', docType: docType});
            secondaryList = await this.manager.find(DeedType, {scope: 'secondary', docType: docType});
            list = [{
                name: '',
                data: masterList
            }, {
                name: '',
                data: secondaryList
            }];
        }
        this.setState({masterList: masterList, secondaryList: secondaryList, list: list});
    }

    componentDidMount() {
        this.manager = getManager();
        const {docType} = this.props;
        if (docType.length > 0)
            this.loadList(docType);
        else
            this.props.onDismiss(null);
    }

    componentDidUpdate(prevProps) {
        this.loadList(this.props.docType);
    }

    keyExtractor = (item, index) => String(item.id);

    render() {
        if (this.state.masterList.length > 0)
            return (
                <SafeAreaView>
                    <Portal>
                        <Dialog
                            style={styles.dialogFlat}
                            visible={this.props.visible}
                            dismissable={false}
                        >
                            <Dialog.ScrollArea>
                                <SectionList
                                    style={{paddingTop: 10}}
                                    keyExtractor={this.keyExtractor}
                                    sections={this.state.list}
                                    renderItem={({item}) =>
                                        <TouchableOpacity style={[styles.card]}
                                                          onPress={() => {
                                                              this.props.onSelected(item);
                                                          }}>
                                            <Text style={ styles.name }>{item.name}</Text>
                                        </TouchableOpacity>
                                    }
                                    renderSectionHeader={({section: {name}}) => {
                                        if (name.length > 0) {
                                            return (
                                                <TouchableOpacity style={[styles.section]}>
                                                    <Text style={ styles.sectionName }>{name}:</Text>
                                                </TouchableOpacity>
                                            );
                                        }
                                        return;
                                    }}

                                    renderSectionFooter={() => (<View style={{margin: 20}}></View>)}
                                />
                                <View>
                                    <Button
                                        style={styles.button}
                                        color={Palette.light}
                                        mode="contained"
                                        onPress={this.props.onDismiss}><Text
                                        style={styles.textButton}>Cancel</Text></Button>
                                </View>
                            </Dialog.ScrollArea>

                        </Dialog>
                    </Portal>

                </SafeAreaView>
            );
        else
            return (null);
    }
};

const styles = StyleSheet.create({
    dialogFlat: {
        marginHorizontal: 10,
        backgroundColor: Palette.gray,
        maxHeight: 0.8 * Dimensions.get('window').height
    },
    card: {
        shadowColor: '#00000021',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.37,
        shadowRadius: 5.49,
        elevation: 6,

        marginVertical: 2,
        backgroundColor: Palette.light,
        padding: 10,
    },
    name: {
        fontSize: 16,
        flex: 1,
        color: Palette.primary,
        textAlign: 'center'
    },
    section: {
        padding: 10,
    },
    sectionName: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
        color: Palette.primary,
        textAlign: 'center'
    },
    button: {
        borderRadius: 10,
        marginVertical: 10
    },
    textButton: {
        color: Palette.primary,
        fontSize: 16
    }
});