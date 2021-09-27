import React, {Component} from 'react';
import {StyleSheet, View, TouchableOpacity, FlatList, SafeAreaView, Image} from 'react-native';
import {Button, Headline} from 'react-native-paper';
import {styles} from "src/Style/app.style";
import {Palette} from "src/Style/app.theme";
import ImageViewer from 'src/components/reusable/ImageViewer';
import {generateCompletePathHomeImages} from 'src/utils/FileStorage';
import {DbImage} from 'src/entities/index';

const moment = require("moment");

export default class ImageGallery extends Component {

    constructor(props) {
        super(props);
        this.token = '';
        const title = props.navigation.getParam('title', undefined);
        const dataSource = props.navigation.getParam('dataSource', []);
        const folder = props.navigation.getParam('folder', '');
        const columns = props.navigation.getParam('columns', 3);
        const imageListViewer = props.navigation.getParam('imageListViewer', []);
        this.state = {
            imagesUri: [{uri: ''}],
            isViewerVisible: false,
            viewerLastState: false,
            index: 0,
            columns: 3,
            title: title,
            folder: folder,
            dbImageList: dataSource,
            dbImageData: [],
            imageListViewer: [],
            showFilter: false,
            showCropper: false,
            path: generateCompletePathHomeImages(title) + folder
        };
        this.saveImage = this.saveImage.bind(this);
        this.cancelCamera = this.cancelCamera.bind(this);
        this.loadImageList();
    }

    updateImage(objImage, index) {
        let {dbImageList, dbImageData} = this.state;
        let tmpDbImage = dbImageList[index];
        tmpDbImage.name = objImage.originalName;
        delete objImage.props;
        tmpDbImage.imageData.uri = objImage.uri.replace('jpeg', 'jpg');
        tmpDbImage.imageData.url = objImage.uri.replace('jpeg', 'jpg');
        tmpDbImage.imageData.mimeType = objImage.mimeType.replace('jpeg', 'jpg');
        tmpDbImage.ignoreUpdateSyncedAt = false;
        dbImageList[index] = tmpDbImage;
        dbImageData[index] = tmpDbImage.imageData;
        this.setState({dbImageList, dbImageData: []});
        this.saveImages(dbImageList);
        this.loadImageList();
    }

    saveImages(dbImageList) {
        const {navigation} = this.props;
        let callbackSaveImages = navigation.getParam('saveImages');
        callbackSaveImages(dbImageList);
    }

    saveImage(dbImage, index) {
        let {dbImageList, dbImageData} = this.state;
        if (dbImageList == null || dbImageData == null) {
            dbImageList = [];
            dbImageData = [];
        }
        delete dbImage.imageData.props;
        dbImage.imageData.uri = dbImage.imageData.uri.replace('jpeg', 'jpg');
        dbImage.imageData.url = dbImage.imageData.uri.replace('jpeg', 'jpg');
        dbImage.imageData.mimeType = dbImage.imageData.mimeType.replace('jpeg', 'jpg');
        dbImageList.push(dbImage);
        dbImageData.push(dbImage.imageData);
        this.setState({dbImageList, dbImageData});
        const {navigation} = this.props;
        let callbackSaveImages = navigation.getParam('saveImages');
        callbackSaveImages(dbImageList);
        this.showViewer(true, dbImageData, dbImageData.length - 1, true);
    }

    cancelCamera(index) {
        index = index == null ? 0 : index;
        if (this.state.viewerLastState)
            this.showViewer(true, this.state.dbImageData, index);
    }

    removeImage(index) {
        let {dbImageList, dbImageData, isViewerVisible} = this.state;
        if (index >= 0 && dbImageList.length > 0) {
            let {navigation} = this.props;
            let dbImage = dbImageList[index];
            if (dbImage.id != null) {
                let callbackDeleteImage = navigation.getParam('removeImage');
                callbackDeleteImage(dbImage);
            }
            dbImageList.splice(index, 1);
            dbImageData.splice(index, 1);
            isViewerVisible = dbImageList.length > 0;
            index--;
            if (index < 0)
                index = 0;
            this.setState({dbImageList, dbImageData, index, isViewerVisible, imagesUri: dbImageData});
        }
    }

    showViewer(visible, imagesList, index = 0, showFilter = false, showCropper = false) {
        if (index == null)
            index = imagesList.length - 1;
        this.setState({
            isViewerVisible: visible,
            imagesUri: imagesList,
            index: index,
            showFilter: showFilter,
            showCropper: showCropper,
        });
    }

    showImagePicker(index) {
        this.setState({viewerLastState: this.state.isViewerVisible});
        let params = {
            path: generateCompletePathHomeImages(this.state.title) + this.state.folder,
            saveImage: this.saveImage,
            onCancel: this.cancelCamera,
        };
        if (index != null)
            params.index = index;
        this.props.navigation.navigate('camera', params);
        this.showViewer(false, this.state.dbImageData, index);
    }

    loadImageList() {
        let {dbImageList, dbImageData} = this.state;
        let tmpImageData = 0;
        dbImageList.forEach(async (dbImage) => {
            tmpImageData = dbImage.imageData;
            if (tmpImageData && tmpImageData.uri) {
                tmpImageData.uri = dbImage.imageData.uri.replace('jpeg', 'jpg');
                tmpImageData.url = dbImage.imageData.uri.replace('jpeg', 'jpg');
                dbImageData.push(tmpImageData);
            }
        });
        this.setState({dbImageList, dbImageData});
    }

    render() {
        return (
            (this.state.isViewerVisible) ?
                <ImageViewer
                    visible={this.state.isViewerVisible}
                    showSelectButton={false}
                    images={this.state.imagesUri}
                    index={this.state.index}
                    showFilter={this.state.showFilter}
                    showCropper={this.state.showCropper}
                    onClose={() => {
                        this.showViewer(false, []);
                    }}
                    onRemove={(image, index) => {
                        this.removeImage(index);
                    }}
                    onTakePicture={(index) => {
                        this.showImagePicker(index);
                    }}
                    onSaveImage={(image, index) => {
                        this.updateImage(image, index);
                    }}
                />
                :
                <SafeAreaView style={{flexGrow: 1, justifyContent: 'center', backgroundColor: Palette.gray}}>
                    {
                        (this.state.title && this.state.dbImageData.length > 0) ?
                            <View style={styles.containerFlat}>
                                <FlatList
                                    data={this.state.dbImageData}
                                    renderItem={({item, index}) => (
                                        <View style={{flexDirection: 'column'}}>
                                            <TouchableOpacity
                                                key={item.id}
                                                style={{flex: 1}}
                                                onPress={() => {
                                                    this.showViewer(true, this.state.dbImageData, index);
                                                }}>
                                                <Image resizeMode={'contain'}
                                                       style={stylesGallery.image}
                                                       source={{uri: item.uri}}
                                                />
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                    numColumns={this.state.columns}
                                    keyExtractor={(item, index) => index.toString()}
                                />

                            </View>
                            :
                            <View style={styles.containerFlat}>
                                <Headline style={{textAlign: 'center'}}>No Images</Headline>
                            </View>
                    }
                    <View styles={styles.formBottomButton}>
                        <Button
                            style={{margin: 20}}
                            mode="contained"
                            icon="camera-outline"
                            onPress={() => {
                                this.showImagePicker();
                            }}

                        >Add Image</Button>
                    </View>
                </SafeAreaView>

        );
    }
}

const stylesGallery = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        height: '100%'
    },
    image: {
        marginVertical: 5,
        marginHorizontal: 1,
        paddingHorizontal: 0,
        height: 130,
        width: 130
    },
    fullImageStyle: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        width: '98%',
        resizeMode: 'contain',
    },
    modelStyle: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
    },
    closeButtonStyle: {
        width: 30,
        height: 30,
        top: 5,
        right: 10,
        position: 'absolute',
    },
});