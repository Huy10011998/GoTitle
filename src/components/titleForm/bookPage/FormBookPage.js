//Import a library to help create a component

import React, {Component, Fragment} from 'react';

import {View, Text} from 'react-native';
import {TextInput, IconButton, withTheme} from 'react-native-paper';
import { styles } from 'src/Style/app.style';

class FormBookPage extends Component {

    constructor(props) {
        super(props);

        let {bookPageList} = this.props;
        if (!bookPageList) {
            bookPageList = [];
        }
        this.state = {
            bookPageList: bookPageList,
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
            return (
                <Fragment key={key}>
                    <View style={[styles.formRow,{alignItems: 'center'}]}>
                        <TextInput
                            label="B"
                            mode='outlined'
                            style={[styles.formControl, {marginRight: 5}]}
                            value={item.book ? String(item.book) : null}
                            onChangeText={(book) => {
                                let newState = {...this.state};
                                newState.bookPageList[key].book = book;
                                this.setState(newState);
                            }}
                        />
                        <TextInput
                            label="P"
                            mode='outlined'
                            style={[styles.formControl, {marginLeft: 5}]}
                            value={item.page ? String(item.page) : null}
                            onChangeText={(page) => {
                                let newState = {...this.state};
                                newState.bookPageList[key].page = page;
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
                </Fragment>
            )
        })
    };

    render() {
        const { title } = this.props;
        return (
            <View>
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
            </View>
        );
    }
}

export default withTheme(FormBookPage);