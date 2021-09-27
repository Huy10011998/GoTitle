import React, {Component} from 'react';

import { View, StyleSheet } from 'react-native';

import { Checkbox, Card, Subheading, Paragraph, TouchableRipple, withTheme} from 'react-native-paper';
import { styles } from 'src/Style/app.style';

//Create a components
class FormCheckBox extends Component {

    constructor(props){
        super(props);
        let tmpTitle = this.props.title;
        if (!tmpTitle.zones) {
            tmpTitle.zones = {
                ne:{},
                nw:{},
                se:{},
                sw:{},
            }
        }
        this.state = {
            tmpTitle: tmpTitle,
        }
    }

    render() {
        let { tmpTitle } = this.state;
        const { colors } = this.props.theme;
        return (
            <View>
                <View style={customStyles.container}>

                    <Card style={[styles.card, customStyles.boxItem, {marginRight: 15/2}]}>
                        <Card.Content>
                            <Subheading style={[styles.subheading,{color: colors.placeholder}]}>NW 1/4</Subheading>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.nw.nw = !tmpTitle.zones.nw.nw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.nw.nw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.nw.ne = !tmpTitle.zones.nw.ne;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.nw.ne ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.nw.sw = !tmpTitle.zones.nw.sw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.nw.sw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.nw.se = !tmpTitle.zones.nw.se;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.nw.se ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.card, customStyles.boxItem, {marginLeft: 15/2}]}>
                        <Card.Content>
                            <Subheading style={[styles.subheading,{color: colors.placeholder}]}>NE 1/4</Subheading>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.ne.nw = !tmpTitle.zones.ne.nw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.ne.nw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.ne.ne = !tmpTitle.zones.ne.ne;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.ne.ne ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.ne.sw = !tmpTitle.zones.ne.sw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.ne.sw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.ne.se = !tmpTitle.zones.ne.se;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.ne.se ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                        </Card.Content>
                    </Card>
                </View>
                <View style={customStyles.container}>
                    <Card style={[styles.card, customStyles.boxItem, {marginRight: 15/2}]}>
                        <Card.Content>
                            <Subheading style={[styles.subheading,{color: colors.placeholder}]}>SW 1/4</Subheading>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.sw.nw = !tmpTitle.zones.sw.nw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.sw.nw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.sw.ne = !tmpTitle.zones.sw.ne;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.sw.ne ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.sw.sw = !tmpTitle.zones.sw.sw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.sw.sw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.sw.se = !tmpTitle.zones.sw.se;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.sw.se ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                        </Card.Content>
                    </Card>
                    <Card style={[styles.card, customStyles.boxItem, {marginLeft: 15/2}]}>
                        <Card.Content>
                            <Subheading style={[styles.subheading,{color: colors.placeholder}]}>SE 1/4</Subheading>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.se.nw = !tmpTitle.zones.se.nw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.se.nw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.se.ne = !tmpTitle.zones.se.ne;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.se.ne ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>NE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.se.sw = !tmpTitle.zones.se.sw;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.se.sw ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SW 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                            <TouchableRipple
                                onPress={() => {
                                    tmpTitle.zones.se.se = !tmpTitle.zones.se.se;
                                    this.setState({tmpTitle: tmpTitle});
                                }}
                            >
                                <View style={customStyles.row}>
                                    <View pointerEvents="none">
                                        <Checkbox
                                            color={colors.primary}
                                            status={tmpTitle.zones.se.se ? 'checked' : 'unchecked'}
                                        />
                                    </View>
                                    <Paragraph>SE 1/4</Paragraph>
                                </View>
                            </TouchableRipple>
                        </Card.Content>
                    </Card>
                </View>
            </View>
        );
    }
}

const customStyles = StyleSheet.create({
    container:{
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end' // if you want to fill rows left to right
    },
    boxItem:{
        flex: 1,
        flexDirection: 'column',
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
});

export default withTheme(FormCheckBox);