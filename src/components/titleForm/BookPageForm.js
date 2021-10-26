import React, {Component} from 'react';
import {View, TouchableOpacity, Image} from 'react-native';
import {TextInput, IconButton} from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {Palette} from 'src/Style/app.theme';
import {styles} from 'src/Style/app.style';

export default class BookPageForm extends Component {

    static defaultProps = {
        item: {},
        bookName: 'book',
        pageName: 'page',
        removeButton: true,
        onRemove: (item) => {
            console.log('onRemove Event', item);
        },
        onChange: (item) => {
            console.log('onChangeEvent', item);
        },
        onImagePress: (item) => {
            console.log('onImagePress', item)
        }
    };

    constructor(props) {
        super(props);
    }

    render() {
        return (
            <View style={[styles.formRow]}>
                <TouchableOpacity onPress={() => {
                    this.props.onImagePress({...this.props.item});
                }}>
                    <ImageThumbnail image={this.props.item.image}/>
                </TouchableOpacity>
                <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary}}>
                    <TextInput
                        style={[styles.formControl, {marginRight: 10}]}
                        label=""
                        backgroundColor="#fff"
                        mode= "flat"
                        underlineColor="none"
                        placeholder="Book"
                        value={ this.props.item[this.props.bookName] ? String(this.props.item[this.props.bookName]) : null }
                        onChangeText={(book) => {
                            let newItem = {...this.props.item};
                            newItem[this.props.bookName] = book;
                            this.props.onChange(newItem);
                        }}
                        theme={{
                            colors: {
                                placeholder: Palette.graytextinput,
                                text: Palette.graytextinput,
                                primary: Palette.primary,
                                underlineColor: 'transparent',
                                background: '#F2F2F2'
                            }
                        }}
                    />
                </View>
                <View style={{flex: 1,borderRadius: 12,borderWidth: 1,borderColor: Palette.primary,marginLeft: 10}}>
                    <TextInput
                        style={[styles.formControl, {marginLeft:10}]}
                        label=""
                        backgroundColor="#fff"
                        mode= "flat"
                        underlineColor="none"
                        placeholder="Page"
                        value={ this.props.item[this.props.pageName] ? String(this.props.item[this.props.pageName]) : null }
                        onChangeText={(page) => {
                            let newItem = {...this.props.item};
                            newItem[this.props.pageName] = page;
                            this.props.onChange(newItem);
                        }}
                        theme={{
                            colors: {
                                placeholder: Palette.graytextinput,
                                text: Palette.graytextinput,
                                primary: Palette.primary,
                                underlineColor: 'transparent',
                                background: '#F2F2F2'
                            }
                        }}
                    />  
                </View>
                {
                    this.props.removeButton ?
                        <DeleteIconButton 
                            onPress={() => {
                            this.props.onRemove({...this.props.item});
                        }}/> : null
                }
            </View>
        )
    }
}

function ImageThumbnail(props) {
    let template;
    if (props.image && props.image.uri) {
        template = (
            <Image style={{
                width: 40,
                height: 40
            }} source={{uri: props.image.uri}}/>
        );
    } else {
        template = <Icon name="insert-drive-file" size={40} color={Palette.secondary}/>
    }
    return template;
}

function DeleteIconButton(props) {
    return (<Icon
        name="remove-circle-outline"
        color="red"
        size={30}
        onPress={props.onPress}
    />)
}