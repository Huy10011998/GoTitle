import React, {Component} from 'react';
import {View, Modal, StyleSheet, Text, SafeAreaView, TouchableOpacity} from 'react-native';
import {FAB, Button} from 'react-native-paper';
import Icon from "react-native-vector-icons/MaterialIcons";
import {Palette} from 'src/Style/app.theme';
import NativeImageViewer from 'react-native-image-zoom-viewer';
import RNFS from 'react-native-fs';
import ImageFilter from 'src/components/reusable/ImageFilter';

const moment = require("moment");


export default class ImageViewer extends Component {
    static defaultProps = {
        index: 0,
        visible: false,
        showFilter: false,
        showCropper: false,
        images: [],
        onClose: () => {
        },
        onTakePicture: () => {
        },
        onRemove: () => {
        },
        onSaveImage: () => {
        },
    };

    constructor(props) {
        super(props);
        this.remove = this.remove.bind(this);
        this.state = {
            showImageFilter: (this.props.showFilter != null && this.props.showFilter) ? true : false,
            showImageCropper: (this.props.showCropper != null && this.props.showCropper) ? true : false,
            changeFilter: false,
            imageUri: '',
            amountContrast: 1,
            amountBrightness: 1,
            position: this.props.index,
            amountGrayScale: 0,
            images: this.props.images,
        };

    }

    remove() {
        let position = this.state.position;
        this.props.onRemove(this.props.images[this.state.position], this.state.position);
        if (position !== 0) {
            position = position - 1;
        }
        this.setState({position: position});
    }

    saveImageFilter(imageUri) {
        let {images, position} = this.state;
        let newMimeType = 'png';
        let objImage = images[position];
        let newFileName = moment().format('DDMMYY_HHmmSSS');
        let pathNew = objImage.uri.replace(objImage.originalName + '.' + objImage.mimeType, newFileName + '.' + newMimeType);

        RNFS.moveFile(imageUri, pathNew).then(() => {
            objImage.originalName = newFileName;
            objImage.uri = pathNew;
            objImage.url = pathNew;
            objImage.mimeType = newMimeType;
            delete objImage.props;
            images[position] = objImage;
            this.setState({images: images});
            this.props.onSaveImage(objImage, position);
        }).catch((error) => {
            console.warn(error.message);
        });
    }

    switchFilterViewer() {
        if (this.state.showImageFilter) {
            this.setState({showImageFilter: false, showImageCropper: false});
        } else {
            this.setState({showImageFilter: true, showImageCropper: false});
        }
    }

    cancel() {
        let {showImageFilter} = this.state;

        if (showImageFilter) {
            this.setState({showImageFilter: false})
        } else {
            this.props.onClose();
        }
    }

    addImage() {
        this.props.onTakePicture(this.state.position);
    }

    renderFilter() {
        let {images, position, showImageCropper} = this.state;
        return (
            <ImageFilter
                imageUri={images[position].uri}
                applyLastFilter={false}
                showCropper={showImageCropper}
                onCancel={ () => {
                    this.switchFilterViewer();
                }}
                onApply={ (imageUri) => {
                    this.saveImageFilter(imageUri);
                    this.switchFilterViewer();
                }}
            />
        );
    }

    render() {
        let {showImageFilter, showImageCropper, images} = this.state;
        return (
            <Modal visible={ this.props.visible } transparent={false} style={{backgroundColor: Palette.black}}>
                <SafeAreaView style={{flex: 1, flexDirection: 'column', backgroundColor: Palette.black}}>
                    {
                        (showImageFilter || showImageCropper) ?
                            this.renderFilter()
                            :
                            <View style={{flex: 1}}>
                                <NativeImageViewer
                                    style={{flex: 2}}
                                    imageUrls={images}
                                    index={this.state.position}
                                    onChange={(index) => {
                                        this.setState({position: index});
                                    }}
                                    saveToLocalByLongPress={false}
                                    enableSwipeDown={true}
                                    onSwipeDown={ this.props.onClose}
                                    enablePreload={false}
                                />

                                <FAB style={{position: "absolute", top: 35, left: 15, backgroundColor: Palette.primary}}
                                     small
                                     color="white"
                                     icon={'close'}
                                     onPress={ () => {
                                         this.cancel();
                                     }}
                                />
                                <View style={stylesImageViewer.bottomBar}>
                                    <Button
                                        style={{flex: 1}}
                                        uppercase={false}
                                        color="white"
                                        mode="text"
                                        onPress={this.remove}
                                    ><Text style={{fontSize: 17}}>Remove</Text></Button>
                                    <TouchableOpacity
                                        style={{
                                            flex: 1,
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignContent: 'center'
                                        }}
                                        onPress={()=>this.addImage()}
                                    >
                                        <Icon name="camera-alt" size={30} color={Palette.light}
                                              style={{alignSelf: 'center'}}/>
                                        <Text style={{fontSize: 12, color: Palette.light, alignSelf: 'center'}}>Add
                                            page</Text>
                                    </TouchableOpacity>
                                    <Button
                                        style={{flex: 1}}
                                        uppercase={false}
                                        mode="text"
                                        color="white"
                                        onPress={ () => {
                                            this.switchFilterViewer();
                                        }}
                                    ><Text style={{fontSize: 17}}>Edit</Text></Button>
                                </View>
                            </View>
                    }
                </SafeAreaView>
            </Modal>
        )
    }

}
const stylesImageViewer = StyleSheet.create({
    card: {
        alignContent: 'center',
        elevation: 3,
        backgroundColor: '#000',
        padding: 0,
        color: '#000',
        marginHorizontal: 0,
        position: 'absolute',

    },
    image: {
        height: 50,
        width: 40,
    },
    textFilter: {
        marginHorizontal: 20,
        fontSize: 12,
        margin: 10
    },
    bottomBar: {
        backgroundColor: Palette.black,
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
        paddingTop: 0,
        paddingBottom: 15,
        paddingHorizontal: 5,
    }
});
