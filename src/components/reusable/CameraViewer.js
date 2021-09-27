import React, {Component} from 'react';
import {View, Image, StyleSheet, Text, SafeAreaView} from 'react-native';
import {Button, Card, IconButton, ActivityIndicator} from 'react-native-paper';
import {Palette} from 'src/Style/app.theme';
import {Grayscale, Contrast, Brightness} from 'react-native-image-filter-kit';

const moment = require("moment");

export default class CameraViewer extends Component {
    static defaultProps = {
        index: 0,
        visible: false,
        showSelectButton: true,
        showCloseButton: true,
        showFilterImage: false,
        showCropImage: false,
        image: {uri: ''},

        onClose: () => {
        },
        onTakePicture: () => {
        },
        onRemove: () => {
        },
        onSelected: () => {
        },
        onSaveImage: () => {
        },

    };

    constructor(props) {
        super(props);
        let image = this.props.image;
        this.remove = this.remove.bind(this);
        this.select = this.select.bind(this);

        this.state = {
            showImageFilter: true,
            showCardFilter: false,
            changeFilter: false,
            image: image,
            pathCache: '',
            amountContrast: 1.2,
            amountBrightness: 1,
            position: this.props.index,
            pathEdit: [{
                uri: ''
            }],
            amountGrayScale: 0
        };
    }

    componentDidMount() {
        this.setState({showSaveButton: true});
    }

    remove() {
        let position = this.state.position;
        this.props.onRemove(this.props.image, this.state.position);
        if (position !== 0) {
            position = position - 1;
        }
        this.setState({position: position});
    }

    select() {
        this.props.onSelected(this.props.image, this.state.position);
    }

    saveImageFilter() {
        let {pathCache, image} = this.state;
        if (pathCache != null && pathCache.length > 0) {
            image.uri = pathCache;
            image.url = pathCache;
        }
        this.props.onSaveImage(image);
    }

    renderViewer() {
        let {amountContrast, amountBrightness, amountGrayScale} = this.state;
        return (
            <View style={stylesImageViewer.container}>
                {(Platform.OS == 'ios') ?
                    null
                    :
                    <View style={stylesImageViewer.topBar}>
                        <IconButton
                            style={stylesImageViewer.roundButton}
                            icon="close"
                            color={Palette.light}
                            size={30}
                            onPress={ this.props.onClose }
                        />
                        {(this.state.showSaveButton) ?
                            <IconButton
                                style={stylesImageViewer.roundButton}
                                icon="check"
                                color={Palette.light}
                                size={30}
                                onPress={ () => {
                                    this.saveImageFilter();
                                } }
                            />
                            : <ActivityIndicator
                                color={Palette.primary}
                                size={30}
                                style={{paddingRight: 15}}
                            />
                        }
                    </View>
                }
                <Card style={{
                    flex: 1,
                    flexDirection: 'row',
                    backgroundColor: '#000',
                    // width: '100%',
                    justifyContent: 'center',
                    // height: '100%',
                }}>
                    <Card.Content>
                        <Contrast
                            extractImageEnabled={true}
                            onFilteringError={
                                ({nativeEvent}) => console.warn(nativeEvent.message)
                            }
                            onExtractImage={image => {
                                this.setState({pathCache: image.nativeEvent.uri, showSaveButton: true});
                            }}
                            cleanExtractedImagesCache={true}
                            amount={amountContrast}
                            image={
                                <Brightness
                                    amount={amountBrightness}
                                    image={
                                        <Grayscale
                                            amount={amountGrayScale}
                                            image={
                                                <Image
                                                    resizeMode={'contain'}
                                                    style={{
                                                        width: '100%',
                                                        height: '100%',
                                                    }}
                                                    source={ {uri: this.state.image.uri}}/>
                                            }
                                        />
                                    }
                                />
                            }
                        />

                    </Card.Content>
                </Card>
                {(Platform.OS == 'ios') ?
                    <View style={stylesImageViewer.bottomBar}>
                        <Button
                            mode="text"
                            color={Palette.light}
                            size={30}
                            uppercase={false}
                            onPress={ this.props.onClose }
                        ><Text style={{fontSize: 17}}>Retake</Text></Button>
                        {(this.state.showSaveButton) ?
                            <Button
                                mode="text"
                                color={Palette.light}
                                size={30}
                                uppercase={false}
                                onPress={ () => {
                                    this.saveImageFilter();
                                } }
                            ><Text style={{fontSize: 17}}>Use Photo</Text></Button>
                            : <ActivityIndicator
                                color={Palette.primary}
                                size={30}
                                style={{paddingRight: 15}}
                            />
                        }

                    </View>
                    :
                    null
                }
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView style={{flex:1}}>
                {this.renderViewer()}
            </SafeAreaView>
        )
    }
}
const stylesImageViewer = StyleSheet.create({
    roundButton: {
        borderColor: Palette.primary,
        borderRadius: 50,
        borderWidth: 2
    },
    topBar: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 0,
        paddingBottom: 0,
        paddingTop: 10,
        paddingHorizontal: 10,
    },
    bottomBar: {
        flex: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 0,
        paddingTop: 0,
        paddingBottom: 10,
        paddingHorizontal: 10,
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Palette.black
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
    },
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
    }

});
