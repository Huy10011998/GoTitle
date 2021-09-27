/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, {Component} from 'react';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {View} from 'react-native';
import {Divider, Text, Paragraph, List} from 'react-native-paper';
import styles from '../title.style';


export default class TitleLien extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {data} = this.props;
        return (
            <View>
                {/*<Divider/>*/}
                {/*Lien Type*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="check"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Lien Type: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.lienType.name}
                        </Paragraph>
                    </View>
                </View>

                {/* Lienor/Plaintiff*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="date-range"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Lienor/Plaintiff: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.lienor}
                        </Paragraph>
                    </View>
                </View>

                {/* Debtor/Defendant*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="date-range"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Debtor/Defendant: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.debtor}
                        </Paragraph>
                    </View>
                </View>

                {/*Book and Page*/}
                <View style={styles.detailView}>
                    <View style={[styles.detailView, styles.detailMarginRigth]}>
                        <View>
                            <Icon name="library-books"
                                  style={styles.detailIcon} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.detailTitle}>
                                <Text style={{ marginLeft: 10 }}>Book
                                </Text>
                                <Text style={styles.detailDescription} >({data.book})</Text>
                            </Text>
                        </View>
                    </View>

                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <View>
                            <Icon name="library-books"
                                  style={styles.detailIcon} />
                        </View>
                        <View style={{ marginLeft: 10 }}>
                            <Text style={styles.detailTitle}>
                                <Text style={{ marginLeft: 10 }}> Page
                                    <Text style={styles.detailDescription}>({data.page})</Text>
                                </Text>

                            </Text>
                        </View>
                    </View>
                </View>

                {/*Amount*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="attach-money"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Amount: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.amount}
                        </Paragraph>
                    </View>
                </View>

                {/*Nulla Bonna/Extension*/}
                <View style={styles.detailView}>
                    <View style={{marginLeft: 10}}>
                        <Text icon="person" style={{fontSize: 16}}>
                            Nulla Bonna/Extension
                        </Text>
                    </View>
                </View>
                {/*Book and Page and transferred*/}
                <View style={styles.detailBorderColor}>
                    <View style={styles.detailView}>
                        <View style={[styles.detailView, styles.detailMarginRigth]}>
                            <View>
                                <Icon name="library-books"
                                      style={styles.detailIcon}/>
                            </View>
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.detailTitle}>
                                    <Text style={{marginLeft: 10}}>Book</Text>
                                    <Text style={styles.detailDescription}>
                                        ({data.deedList[0].book})
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.detailView, styles.detailMarginLeft]}>
                            <View>
                                <Icon name="library-books"
                                      style={styles.detailIcon}/>
                            </View>
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.detailTitle}>
                                    <Text style={{marginLeft: 10}}> Page
                                        <Text style={styles.detailDescription}>
                                            ({data.deedList[0].page})
                                        </Text>
                                    </Text>

                                </Text>
                            </View>
                        </View>
                    </View>
                </View>

                {/*Assigned/Transferred*/}
                <View style={styles.detailView}>
                    <View style={{marginLeft: 10}}>
                        <Text icon="person" style={{fontSize: 16}}>
                            Assigned/Transferred
                        </Text>
                    </View>
                </View>
                {/*Book and Page and transferred*/}
                <View style={styles.detailBorderColor}>
                    <View style={styles.detailView}>
                        <View style={[styles.detailView, styles.detailMarginRigth]}>
                            <View>
                                <Icon name="library-books"
                                      style={styles.detailIcon}/>
                            </View>
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.detailTitle}>
                                    <Text style={{marginLeft: 10}}>Book</Text>
                                    <Text style={styles.detailDescription}>
                                        ({data.transferList[0].deedBook})
                                    </Text>
                                </Text>
                            </View>
                        </View>

                        <View style={[styles.detailView, styles.detailMarginLeft]}>
                            <View>
                                <Icon name="library-books"
                                      style={styles.detailIcon}/>
                            </View>
                            <View style={{marginLeft: 10}}>
                                <Text style={styles.detailTitle}>
                                    <Text style={{marginLeft: 10}}> Page
                                        <Text style={styles.detailDescription}>
                                            ({data.transferList[0].deedPage})</Text>
                                    </Text>

                                </Text>
                            </View>
                        </View>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginTop]}>
                        <View>
                            <Icon name="attach-money"
                                  style={styles.detailIcon}/>
                        </View>
                        <View style={{marginLeft: 10}}>
                            <Text style={styles.detailTitle}> Transferred To </Text>
                            <Paragraph style={styles.detailDescription}>
                                {data.transferList[0].transferred}
                            </Paragraph>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}
