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


export default class TitleEasement extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {data} = this.props;
        return (
            <View>
                {/*<Divider/>*/}
                {/*Easement Type*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="check"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Easement Type: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.easementType.name}
                        </Paragraph>
                    </View>
                </View>

                {/*Deed Date*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="date-range"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Deed Date: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.deedDate.format}
                        </Paragraph>
                    </View>
                </View>

                {/*Date Recorded*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="date-range"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Date Recorded: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.recDate.format}
                        </Paragraph>
                    </View>
                </View>

                {/*Book and Page*/}
                <View style={styles.detailView}>
                    <View style={[styles.detailView, styles.detailMarginRigth]}>
                        <View>
                            <Icon name="library-books"
                                  style={styles.detailIcon}/>
                        </View>
                        <View style={{marginLeft: 10}}>
                            <Text style={styles.detailTitle}>
                                <Text style={{marginLeft: 10}}>Book</Text>
                                <Text style={styles.detailDescription}>({data.deedBook})</Text>
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
                                    <Text style={styles.detailDescription}>({data.deedPage})</Text>
                                </Text>

                            </Text>
                        </View>
                    </View>
                </View>

                {/*Grantor*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="person"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Grantor: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.grantor}
                        </Paragraph>
                    </View>
                </View>

                {/*Grantee*/}
                <View style={styles.detailView}>
                    <View>
                        <Icon name="person"
                              style={styles.detailIcon}/>
                    </View>
                    <View style={[styles.detailView, styles.detailMarginLeft]}>
                        <Text style={styles.detailTitle}>Grantee: </Text>
                        <Paragraph style={styles.detailDescription}>
                            {data.grantee}
                        </Paragraph>
                    </View>
                </View>
            </View>
        );
    }
}
