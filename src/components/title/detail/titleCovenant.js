import React, { Component } from 'react';
import { View, ScrollView } from 'react-native';
import {
    Title,
    Caption,
    Subheading,
    List,
    withTheme,
    Card,
    Avatar,
    Divider,
} from 'react-native-paper';

import { styles, styleTitleInfo as styleTitleMortgage } from 'src/Style/app.style';

const moment = require('moment');

class TitleCovenant extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.navigation.getParam('data'),
        };
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

    renderBookAndPageList = (dataList) => {
        return dataList.map((item, index) => {
            const { colors, fonts } = this.props.theme;
            return (
                <View>
                    {/*Divider*/}
                    {index !== 0 ? <Divider/> : null}
                    <View style={styleTitleMortgage.containerRow}>
                        <View style={styleTitleMortgage.itemRow}>
                            <List.Item
                                left={() => <Avatar.Icon style={styleTitleMortgage.avatarIcon} color={colors.placeholder} size={40} icon="book" />}
                                title={<Caption>Deed Book</Caption>}
                                description={
                                    () =>
                                        <Subheading style={{fontFamily: fonts.medium}}>
                                            {item.deedBook}
                                        </Subheading>
                                }
                            />
                        </View>
                        <View style={styleTitleMortgage.itemRow}>
                            <List.Item
                                title={<Caption>Page</Caption>}
                                description={
                                    () =>
                                        <Subheading style={{fontFamily: fonts.medium}}>
                                            {item.deedPage}
                                        </Subheading>
                                }
                            />
                        </View>
                    </View>
                </View>
            )
        })
    };

    render() {
        const { colors, fonts } = this.props.theme;
        const item = this.state.data;
        return (
            <ScrollView contentContainerStyle={{flexGrow: 1}}>
                <View style={styles.containerFlat}>
                    <Title style={styles.title}>Covenant</Title>
                    <Card style={ styles.card }>
                        <Card.Content>
                            <List.Section>
                                <List.Item
                                    left={() => <Avatar.Icon style={styleTitleMortgage.avatarIcon} color={colors.placeholder} size={40} icon="check-box" />}
                                    title={<Caption>Deed Type</Caption>}
                                    description={
                                        () =>
                                            <Subheading style={{fontFamily: fonts.medium}}>
                                                {item.type}
                                            </Subheading>
                                    }
                                />
                                <View style={styleTitleMortgage.containerRow}>
                                    <View style={styleTitleMortgage.itemRow}>
                                        <List.Item
                                            left={() => <Avatar.Icon style={styleTitleMortgage.avatarIcon} color={colors.placeholder} size={40} icon="book" />}
                                            title={<Caption>Deed Book</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.deedBook}
                                                    </Subheading>
                                            }
                                        />
                                    </View>

                                    <View style={styleTitleMortgage.itemRow}>
                                        <List.Item
                                            title={<Caption>Page</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.deedPage}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                </View>
                                <List.Item
                                    left={() => <Avatar.Icon style={styleTitleMortgage.avatarIcon} color={colors.placeholder} size={40} icon="date-range" />}
                                    title={<Caption>Date Recorded</Caption>}
                                    description={
                                        () =>
                                            <Subheading style={{fontFamily: fonts.medium}}>
                                                {moment(item.dateRecorded.date).format('LL')}
                                            </Subheading>
                                    }
                                />
                            </List.Section>
                            <Card style={ styles.card }>
                                <Card.Content>
                                    <List.Section title={'Amended'}>
                                        {( typeof item.amendedList !== 'undefined' && item.amendedList !== null ) ?
                                            this.renderBookAndPageList(item.amendedList) : null}
                                    </List.Section>
                                </Card.Content>
                            </Card>
                            <Card style={ styles.card }>
                                <Card.Content>
                                    <List.Section title={'Re-Recorded / Corrected'}>
                                        {( typeof item.reRecordedList !== 'undefined' && item.reRecordedList !== null ) ?
                                            this.renderBookAndPageList(item.reRecordedList): null}
                                    </List.Section>
                                </Card.Content>
                            </Card>
                            <Card style={ styles.card }>
                                <Card.Content>
                                    <List.Section title={'Supplemented'}>
                                        {( typeof item.supplementedList !== 'undefined' && item.supplementedList !== null ) ?
                                            this.renderBookAndPageList(item.supplementedList) : null}
                                    </List.Section>
                                </Card.Content>
                            </Card>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        );
    }
}

export default withTheme(TitleCovenant);