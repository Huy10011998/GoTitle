import React, {Component} from 'react';
import {
    StyleSheet,
    View,
    Image,
    TouchableOpacity,
    Text,
    SafeAreaView
} from 'react-native';
import {IconButton} from 'react-native-paper';
import {Palette} from "src/Style/app.theme";
import CameraViewer from 'src/components/reusable/CameraViewer';
import RNFS from 'react-native-fs';
import {requestPermission} from 'src/utils/Permission';
import {RNCamera as NativeCamera} from 'react-native-camera';
import ImagePicker from 'react-native-image-crop-picker'

const moment = require("moment");

const PendingView = () => (
    <View
        style={{
            flex: 1,
            backgroundColor: Palette.primary,
            justifyContent: 'center',
            alignItems: 'center',
        }}
    >
        <Text style={{
            color: Palette.light,
        }}>Waiting...</Text>
    </View>
);

export default class Camera extends Component {

    constructor(props) {
        super(props);
        let path = props.navigation.getParam('path', null);
        let index = props.navigation.getParam('index', null);
        this.camera;
        this.state = {
            image: {uri: ''},
            path: path,
            index: index,
            isViewerVisible: false,
            isCameraVisible: true,
            isOpenCropper: false,
            showPending: true,
            isFlashOn: NativeCamera.Constants.FlashMode.off,
            ratio: "16:9"
        };
        this.save = this.save.bind(this);
    }

    componentDidMount() {
        requestPermission.all().then((permissionDeniedList) => {
            if (permissionDeniedList != null && permissionDeniedList.length == 0)
                this.setState({showPending: false});
            else
                this.props.navigation.goBack();
        }).catch((err) => {
            console.warn(err);
            this.props.navigation.goBack();
        });
    }

    close() {
        let callbackOnCancel = this.props.navigation.getParam('onCancel');
        this.props.navigation.goBack();
        if (callbackOnCancel != null) {
            callbackOnCancel(this.state.index);
        }
    }

    showCamera() {
        this.setState({
            isCameraVisible: true
        });
    }

    takePicture = async function (camera) {
        const options = {
            quality: 0.5,
            base64: true,
            width: 720,
            fixOrientation: true,
            forceUpOrientation: true,
            orientation: NativeCamera.Constants.Orientation.portrait
        };
        const data = await camera.takePictureAsync(options);
        let objImage = {
            originalName: '720_' + moment().format('DDMMYY_HHmmSSS'),
            uri: data.uri,
            url: data.uri,
            mimeType: data.uri.split('.').pop(),
        };

        this.setState({
            // isCameraVisible: false,
            isOpenCropper: true,
            image: objImage
        });
        this.cropImage(objImage);

    };

    switchFlash() {
        let {isFlashOn} = this.state;
        if (isFlashOn == NativeCamera.Constants.FlashMode.on)
            isFlashOn = NativeCamera.Constants.FlashMode.off;
        else
            isFlashOn = NativeCamera.Constants.FlashMode.on;
        this.setState({isFlashOn});
    }

    updateImage(tmpImage) {
        let newPathImage = this.state.path + '/';
        RNFS.exists(newPathImage).then((isExists) => {
            if (!isExists) {
                RNFS.mkdir(newPathImage).then(() => {
                    this.moveImage(tmpImage, newPathImage);
                }).catch((err) => {
                    console.warn("CameraComponent -> UpdateImage -> MKDIR " + err);
                })
            } else {
                this.moveImage(tmpImage, newPathImage);
            }
        });
    }

    moveImage(tmpImage, newPathImage) {
        let newFileName = tmpImage.originalName;
        let prefix = Platform.OS == 'ios' ? '' : 'file://';
        tmpImage.mimeType = 'png';
        newPathImage += newFileName + '.png';
        RNFS.moveFile(tmpImage.uri, newPathImage).then(() => {
            let newDbImage = {
                name: newFileName,
                position: null,
                imageData: {
                    originalName: tmpImage.originalName,
                    uri: prefix + newPathImage,
                    url: prefix + newPathImage,
                    mimeType: tmpImage.mimeType
                }
            };
            this.save(newDbImage);
        }).catch((error) => {
            console.warn("MoveFile Error " + error.message);
        });
    }

    save(dbImage) {
        let callbackSaveImage = this.props.navigation.getParam('saveImage');
        if (callbackSaveImage != null) {
            console.warn("saving picture..");
            this.props.navigation.goBack();
            callbackSaveImage(dbImage, this.state.index);
        } else
            this.props.navigation.goBack();

    }

    cropImage(objImage) {
        Image.getSize(objImage.uri, (width, height) => {
            ImagePicker.openCropper({
                path: objImage.uri,
                freeStyleCropEnabled: true,
                compressImageQuality: 1,
                width: width,
                height: height
            }).then(imageData => {
                objImage.uri = imageData.path;
                objImage.url = imageData.path;
                objImage.mimeType = imageData.path.split('.').pop();
                this.updateImage(objImage);
            }, (error => {
                console.warn(error);
                this.setState({isOpenCropper: false});
            }));
        }, (error) => {
            console.warn(error);
        });
    }

    renderCamera() {
        return (
            <View style={stylesCamera.container}>

                <NativeCamera
                    ref={ref => {
                        this.camera = ref;
                    }}
                    style={stylesCamera.preview}
                    type={NativeCamera.Constants.Type.back}
                    flashMode={this.state.isFlashOn}
                    captureAudio={false}
                    useNativeZoom={true}
                    zoom={0}
                    ratio={this.state.ratio}
                    androidCameraPermissionOptions={{
                        title: 'Permission to use camera',
                        message: 'We need your permission to use your camera',
                        buttonPositive: 'Ok',
                        buttonNegative: 'Cancel',
                    }}
                    onCameraReady={async () => {
                        if (Platform.OS == 'android' && this.camera) {
                            const ratios = await this.camera.getSupportedRatiosAsync();
                            const ratio = ratios.find((ratio) => ratio === '16:9') || ratios[ratios.length - 1];
                            this.setState((prevState) => ({...prevState, ratio: ratio}));
                        }
                    }}
                >
                    {({camera, status}) => {
                        if (status !== NativeCamera.Constants.CameraStatus.READY) return <PendingView />;
                        return (
                            <View style={{height: '100%', flexDirection: 'column'}}>
                                <View style={stylesCamera.topBar}>
                                    <IconButton
                                        icon="close"
                                        color={'#fff'}
                                        size={30}
                                        onPress={() => {
                                            this.close();
                                        }}
                                    />
                                    <IconButton
                                        icon={(this.state.isFlashOn) ? "flash" : "flash-off"}
                                        color={'#fff'}
                                        size={30}
                                        onPress={() => {
                                            this.switchFlash();
                                        }}
                                    />
                                </View>
                                <View style={{flex: 0, flexDirection: 'row', justifyContent: 'center'}}>
                                    <TouchableOpacity onPress={() => this.takePicture(camera)}
                                                      style={stylesCamera.capture}>
                                        <IconButton
                                            icon="circle"
                                            color={'#fff'}
                                            size={70}
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    }}
                </NativeCamera>
            </View>
        );
    }

    renderViewer() {
        return (
            <CameraViewer
                visible={true}
                showSelectButton={false}
                showCloseButton={true}
                showFilterImage={true}
                showCropImage={false}
                image={this.state.image}
                index={this.state.index}
                onClose={() => {
                    this.showCamera();
                }}

                onTakePicture={() => {
                    this.showCamera();
                }}
                onSaveImage={(image) => {
                    this.updateImage(image);
                }}
            />
        );
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1}}>
                {
                    (this.state.isCameraVisible) ?
                        (this.state.showPending) ?
                            null
                            :
                            (this.state.isOpenCropper) ?
                                <View style={{flex: 1, backgroundColor: Palette.black}}></View>
                                :
                                this.renderCamera()
                        :
                        this.renderViewer()
                }
            </SafeAreaView>

        );
    }
}

const stylesCamera = StyleSheet.create({
    topBar: {
        flex: 1,
        flexDirection: 'row',
        paddingHorizontal: 5,
        marginTop: 20,
        justifyContent: 'space-between',
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Palette.black,
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    capture: {
        flex: 0,
        backgroundColor: 'transparent',
        borderRadius: 5,
        padding: 0,
        paddingHorizontal: 10,
        alignSelf: 'center',
        margin: 0,
    }
});