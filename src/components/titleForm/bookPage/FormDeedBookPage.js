//Import a library to help create a component

import React, {Component, Fragment} from 'react';

import {View, Text} from 'react-native';
import {TextInput, IconButton, Card, withTheme} from 'react-native-paper';
import { styles } from 'src/Style/app.style';

class FormDeedBookPage extends Component {

    constructor(props) {
        super(props);
        this.state = {
            bookPageList: this.props.bookPageList,
        };
    }

    onDeleteOut(itemRemove) {
        let newState = {...this.state};
        return this.state.bookPageList.map((item, key) => {
            if(itemRemove.id === item.id){
                newState.bookPageList.splice(key, 1);
                this.setState(newState);
            }
        });
    };

    renderItem = (dataList) => {
        return dataList.map((item, key) => {
            const { transferred } = this.props;
            return (
                <Fragment key={key}>
                    <View style={[styles.formRow,{alignItems: 'center'}]}>
                        <TextInput
                            label="B"
                            mode='outlined'
                            style={[styles.formControl, {marginRight: 5}]}
                            value={item.deedBook ? String(item.deedBook) : null}
                            onChangeText={(deedBook) => {
                                let newState = {...this.state};
                                newState.bookPageList[key].deedBook = deedBook;
                                this.setState(newState);
                            }}
                        />
                        <TextInput
                            label="P"
                            mode='outlined'
                            style={[styles.formControl, {marginLeft: 5}]}
                            value={item.deedPage ? String(item.deedPage) : null}
                            onChangeText={(deedPage) => {
                                let newState = {...this.state};
                                newState.bookPageList[key].deedPage = deedPage;
                                this.setState(newState);
                            }}
                        />
                        <IconButton
                            icon="delete"
                            size={25}
                            color={this.props.theme.colors.error}
                            onPress={() => this.onDeleteOut(item)}
                        />
                    </View>
                    { (typeof transferred !== 'undefined' && transferred === true ) ? (
                        <View style={[styles.formRow,{marginBottom: 10}]}>
                            <TextInput
                                label="Transferred/Assigned to which lender:"
                                style={styles.formControl}
                                value={item.transferred}
                                onChangeText={(transferred) => {
                                    let newState = {...this.state};
                                    newState.bookPageList[key].transferred = transferred;
                                    this.setState(newState);
                                }}
                            />
                        </View>
                    ) : null}
                </Fragment>
            )
        })
    };

    render() {
        const { title } = this.props;
        return (
            <View>
                <Card>
                    <Card.Content>
                    <View style={ [styles.formRow] }>
                        <Text style={ styles.formLabel }>{ title }</Text>
                        <IconButton
                            style={{margin: 0}}
                            icon="add-circle"
                            size={25}
                            color={this.props.theme.colors.primary}
                            onPress={() => {
                                let newState = {...this.state};
                                let newPlat = {};
                                if(this.state.bookPageList.length === 0){
                                    newPlat.id = 1;
                                }else{
                                    newPlat.id = this.state.bookPageList[this.state.bookPageList.length - 1].id + 1;
                                }
                                newState.bookPageList.push(newPlat);
                                this.setState(newState);
                            }}
                        />
                    </View>
                    { this.renderItem(this.state.bookPageList) }
                    </Card.Content>
                </Card>
            </View>
        );
    }
}

export default withTheme(FormDeedBookPage);