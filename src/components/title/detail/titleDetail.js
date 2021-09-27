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
    TextInput,
} from 'react-native-paper';

import { styles, styleTitleInfo as styleTitleDescription } from 'src/Style/app.style';

class TitleDetail extends Component {
    constructor(props) {
        super(props);
        this.state = {
            data: props.navigation.getParam('data'),
        }
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
                    <View style={styleTitleDescription.containerRow}>
                        <View style={styleTitleDescription.itemRow}>
                            <List.Item
                                left={() => <Avatar.Icon style={styleTitleDescription.avatarIcon} color={colors.placeholder} size={40} icon="book" />}
                                title={<Caption>Book</Caption>}
                                description={
                                    () =>
                                        <Subheading style={{fontFamily: fonts.medium}}>
                                            {item.book}
                                        </Subheading>
                                }
                            />
                        </View>
                        <View style={styleTitleDescription.itemRow}>
                            <List.Item
                                title={<Caption>Page</Caption>}
                                description={
                                    () =>
                                        <Subheading style={{fontFamily: fonts.medium}}>
                                            {item.page}
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
                    <Title style={styles.title}>Description</Title>
                    <Card style={ styles.card }>
                        <Card.Content>
                            <List.Section>
                                <List.Item
                                    title={<Caption style={{color: colors.primary}}>Type</Caption>}
                                    description={
                                        () =>
                                            <Subheading style={{fontFamily: fonts.medium}}>
                                                {item.type}
                                            </Subheading>
                                    }
                                />
                                <List.Item
                                    title={<Caption style={{color: colors.primary}}>Subdivision / Condo Name</Caption>}
                                    description={
                                        () =>
                                            <Subheading style={{fontFamily: fonts.medium}}>
                                                {item.condoName}
                                            </Subheading>
                                    }
                                />
                                <View style={styleTitleDescription.containerRow}>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Lot/Unit</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.lot}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Block</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.block}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                </View>
                                <View style={styleTitleDescription.containerRow}>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Phase</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.phase}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>POD</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.pod}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                </View>
                                <View style={styleTitleDescription.containerRow}>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Unit</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.unit}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Sub/Section</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.subdivisionSection}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                </View>
                                <List.Item
                                    title={<Caption style={{color: colors.primary}}>Interest In Common</Caption>}
                                    description={
                                        () =>
                                            <Subheading style={{fontFamily: fonts.medium}}>
                                                {item.interestCommon} %
                                            </Subheading>
                                    }
                                />
                                <View style={styleTitleDescription.containerRow}>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>parking</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.parking}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Garage</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.garage}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                </View>
                                <View style={styleTitleDescription.containerRow}>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Storage</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.storage}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                    <View style={styleTitleDescription.itemRow}>
                                        <List.Item
                                            title={<Caption style={{color: colors.primary}}>Wine</Caption>}
                                            description={
                                                () =>
                                                    <Subheading style={{fontFamily: fonts.medium}}>
                                                        {item.wine}
                                                    </Subheading>
                                            }
                                        />
                                    </View>
                                </View>
                                <Card style={ styles.card }>
                                    <Card.Content>
                                        <List.Section title={'Plat Book/Page'}>
                                            {( typeof item.platList !== 'undefined' && item.platList !== null ) ?
                                                this.renderBookAndPageList(item.platList) : null}
                                        </List.Section>
                                    </Card.Content>
                                </Card>
                                <Card style={ styles.card }>
                                    <Card.Content>
                                        <List.Section title={'Floor Plans Book/Page'}>
                                            {( typeof item.floorPlanList !== 'undefined' && item.floorPlanList !== null ) ?
                                                this.renderBookAndPageList(item.floorPlanList): null}
                                        </List.Section>
                                    </Card.Content>
                                </Card>

                                <List.Item
                                    title={<Caption style={{color: colors.primary}}>Note</Caption>}
                                />
                                <TextInput
                                    multiline={true}
                                    numberOfLines={4}
                                    disabled={true}
                                    value={item.note}
                                />
                            </List.Section>
                        </Card.Content>
                    </Card>
                </View>
            </ScrollView>
        );
    }
}

export default withTheme(TitleDetail);