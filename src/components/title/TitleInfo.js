import React, {Component, Fragment} from "react";
import {FlatList, ScrollView, StyleSheet, TouchableOpacity, View} from "react-native";
import OctIcon from "react-native-vector-icons/Octicons";
import FontAwesomeIcon from "react-native-vector-icons/FontAwesome5";
import AwesomeIcon from "react-native-vector-icons/FontAwesome";
import EntypoICon from "react-native-vector-icons/Entypo";
import {Caption, Card, List, Subheading, withTheme} from "react-native-paper";
import {styles} from "src/Style/app.style";
import {IconPalette} from "src/Style/app.theme";
const moment = require('moment');

import DeedTypeListModal from 'src/components/deedType/deedTypeListModal';


const buttonIconList = [
    {
        iconSet: 'Octicon',
        icon: 'law',
        color: IconPalette[0],
        navigateKey: 'LegalDescriptionForm',
        docType: 'misc_civil_probate',
        title: 'Legal Description'
    },
    {
        iconSet: 'FontAwesome',
        icon: 'book',
        color: IconPalette[1],
        navigateKey: 'PlatFloorForm',
        docType: 'plat_floor_plan',
        title: 'Plat / Floor Plans'
    },
    {
        iconSet: 'Entypo',
        icon: 'open-book',
        color: IconPalette[2],
        navigateKey: 'DeedForm',
        docType: 'chain_of_title',
        title: 'Chain Of Title'
    },
    {
        iconSet: 'FontAwesome5',
        icon: 'file-invoice-dollar',
        color: IconPalette[3],
        navigateKey: 'Mortgage',
        docType: 'mortgage',
        title: 'Mortgages'
    },
    {
        iconSet: 'FontAwesome5',
        icon: 'handshake',
        color: IconPalette[4],
        navigateKey: 'CovenantsForm',
        docType: '',
        title: 'Covenants'
    },
    {
        iconSet: 'FontAwesome5',
        icon: 'map-signs',
        color: IconPalette[5],
        navigateKey: 'EasementForm',
        docType: 'easement',
        title: 'Easements'
    },
    {
        iconSet: 'FontAwesome5',
        icon: 'user-lock',
        color: IconPalette[6],
        navigateKey: 'LienForm',
        docType: 'lien',
        title: 'Liens'
    },
    {
        iconSet: 'FontAwesome5',
        icon: 'book',
        color: IconPalette[2],
        navigateKey: 'MiscCivilProbateForm',
        docType: 'misc_civil_probate',
        title: 'Misc|Tax|Civil|Probate'
    },
    {
        iconSet: 'FontAwesome',
        icon: 'pencil-square-o',
        color: IconPalette[7],
        navigateKey: 'NotesForm',
        docType: '',
        title: 'Note'
    },
    {
        iconSet: 'FontAwesome5',
        icon: 'file-upload',
        color: IconPalette[8],
        navigateKey: 'PublishForm',
        docType: '',
        title: 'Publish'
    },
];

class TitleInfo extends Component {

    constructor(props) {
        super(props);
        var title = props.navigation.getParam('title');
        this.state = {
            edit: true,
            title: title,
            modal: false,
            docType: '',
        }
    }

    onChangeValue = (title) => {
        let newState = {...this.state};
        newState.title = title;
        this.setState(newState);
    };


    renderItem = ({item}) => {
        return (
            <Fragment>
                <TouchableOpacity style={customStyles.boxIcon}
                                  onPress={() => {
                                      this.setState({docType: item.docType});
                                      if (item.docType.length > 0)
                                          this.setState({modal: true, navigateKey: item.navigateKey});
                                      else
                                          this.props.navigation.navigate(item.navigateKey,{title:this.state.title});
                                  }}
                >
                    {item.iconSet === 'Octicon' ? (
                        <OctIcon name={item.icon} size={35} style={customStyles.customIcon} color={item.color}/>
                    ) : null}
                    {item.iconSet === 'Entypo' ? (
                        <EntypoICon name={item.icon} size={35} style={customStyles.customIcon} color={item.color}/>
                    ) : null}
                    {item.iconSet === 'FontAwesome' ? (
                        <AwesomeIcon name={item.icon} size={35} style={customStyles.customIcon} color={item.color}/>
                    ) : null}
                    {item.iconSet === 'FontAwesome5' ? (
                        <FontAwesomeIcon name={item.icon} size={35} style={customStyles.customIcon} color={item.color}/>
                    ) : null}
                    <View style={customStyles.contentTitle}>
                        <Caption style={customStyles.title}>{item.title}</Caption>
                    </View>
                </TouchableOpacity >
            </Fragment>
        );
    };

    render() {
        const {title} = this.state;
        return (
            <Fragment>
                {(this.state.modal) ?
                    <DeedTypeListModal
                        visible={this.state.modal}
                        docType={this.state.docType}
                        onDismiss={() => {
                            this.setState((prevState) => {
                                return {
                                    ...prevState,
                                    modal: false
                                }
                            });
                        }}
                        onSelected={(deedType) => {
                            this.setState((prevState) => {
                                return {
                                    ...prevState,
                                    modal: false
                                }
                            });
                            let {navigateKey} = this.state;
                            if(deedType.docType === 'tax')
                                navigateKey = 'TaxForm';

                            this.props.navigation.navigate(navigateKey, {
                                title: this.state.title,
                                deedType: deedType,
                                onChangeValue: this.onChangeValue
                            });
                        }}
                    /> : <View></View>
                }
                <ScrollView contentContainerStyle={{flexGrow: 1, justifyContent: 'center'}}>
                    <View style={ styles.containerFlat }>
                        <Subheading style={ styles.subheading }>Congratulations! You're all set to run your
                            title!</Subheading>
                        <Card style={ styles.card }>
                            <Card.Content>
                                <List.Item
                                    left={props => <List.Icon {...props} icon="location-on"/>}
                                    title="Address"
                                    description={title.location.name}
                                />
                                <List.Item
                                    left={props => <List.Icon {...props} icon="place"/>}
                                    title="State"
                                    description={title.location.state}
                                />
                                <List.Item
                                    left={props => <List.Icon {...props} icon="search"/>}
                                    title="Search Type"
                                    description={title.searchType}
                                />
                                <List.Item
                                    style={{flex: 1}}
                                    left={props => <List.Icon {...props} icon="date-range"/>}
                                    title={"Date Search"}
                                    description={moment(title.dateSearch).format('LL')}
                                />
                            </Card.Content>
                        </Card>
                        <Subheading style={ styles.subheading }>Now choose what document info you want to register
                            below: </Subheading>
                        <Card style={ styles.card }>
                            <Card.Content style={customStyles.containerBoxIcon}>
                                <FlatList
                                    data={buttonIconList}
                                    numColumns={3}
                                    keyExtractor={(item, index) => {
                                        return index;
                                    }}
                                    renderItem={this.renderItem}
                                />
                            </Card.Content>
                        </Card>
                    </View>

                </ScrollView>
            </Fragment>
        );
    }
}

const customStyles = StyleSheet.create({
    listContainer: {
        alignItems: 'center'
    },
    containerBoxIcon: {
        flex: 1,
        flexWrap: 'wrap',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'flex-end' // if you want to fill rows left to right
    },
    boxIcon: {
        flex: 1,
        flexDirection: 'column',
        margin: 5,
        height: 110
    },
    customIcon: {
        alignSelf: 'center'
    },
    contentTitle: {
        paddingTop: 15,
        alignItems: "center",
        justifyContent: "center"
    },
    title: {
        fontSize: 15,
        textAlign: 'center',
    },
});

export default withTheme(TitleInfo);