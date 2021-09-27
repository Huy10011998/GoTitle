import React, {Component} from 'react';
import {
    View,
    Image,
    StyleSheet,
    Slider,
    Text,
    SafeAreaView,
    FlatList,
    TouchableOpacity,
    TouchableHighlight
} from 'react-native';
import {FAB, IconButton, withTheme} from 'react-native-paper';
import {Palette} from 'src/Style/app.theme';
import {Grayscale, Contrast, Brightness, GenericImageFilter} from 'react-native-image-filter-kit';
import ImagePicker from 'react-native-image-crop-picker'

const moment = require("moment");

const defaultAmountContrast = 1;
const defaultAmountBrightness = 1;
const defaultAmountGrayScale = 1;

class ImageFilter extends Component {
    static defaultProps = {
        imageUri: null,
        applyLastFilter: false,
        showCropper: false,
        onCancel: () => {
        },
        onApply: () => {
        }
    };

    constructor(props) {
        super(props);
        const presets = [
            {id: 1, name: 'Normal', amount: 0},
            {id: 2, name: 'Contrast', amount: 1.5},
            {id: 3, name: 'Brightness', amount: 1.5},
            {id: 4, name: 'Cool', amount: 1},
            {id: 5, name: 'Sepia', amount: 1},
            {id: 6, name: 'Vintage', amount: 1}
        ];
        const defaultPresetIndex = 1;
        this.state = {
            presets: presets,
            showCustomContrast: true,
            showCustomFilter: false,
            showCropper: props.showCropper == null ? false : props.showCropper,
            imageUri: props.imageUri,
            amountContrast: defaultAmountContrast,
            amountBrightness: defaultAmountBrightness,
            amountGrayScale: defaultAmountGrayScale,
            imagePreview: this.props.imageUri,
            presetIndex: defaultPresetIndex,
            configPreview: {
                name: 'Contrast',
                amount: defaultAmountContrast,
                image: {
                    name: 'Brightness',
                    amount: defaultAmountBrightness,
                    image: {
                        name: 'Grayscale',
                        amount: defaultAmountGrayScale,
                        image: {
                            name: presets[defaultPresetIndex].name,
                            amount: presets[defaultPresetIndex].amount,
                            image: <Image
                                resizeMode={'contain'}
                                style={{
                                    width: '100%',
                                    height: '100%',
                                    backgroundColor: 'black'
                                }}
                                source={{uri: this.props.imageUri}}
                            />

                        }
                    }
                }
            }
        };
    }

    componentDidMount() {
        if (this.state.showCropper)
            this.cropImage();
    }

    applyFilter() {
        let {imageUri} = this.state;
        if (imageUri == null)
            imageUri = this.props.imageUri;
        this.props.onApply(imageUri);
    }

    changeFilter(newPresetIndex = null, contrast = null, brightness = null, grayscale = null) {
        let {presets, presetIndex} = this.state;
        if (newPresetIndex == null) {
            newPresetIndex = presetIndex;
        }
        this.setState((prevState) => {
            return {
                ...prevState,
                amountGrayScale: (grayscale != null)? grayscale: prevState.amountGrayScale,
                amountContrast: (contrast != null)? contrast: prevState.amountContrast,
                amountBrightness: (brightness != null)? brightness: prevState.amountBrightness,
                presetIndex: newPresetIndex,
                configPreview: {
                    name: 'Contrast',
                    amount: (contrast != null)? contrast: prevState.amountContrast,
                    image: {
                        name: 'Brightness',
                        amount: (brightness != null)? brightness: prevState.amountBrightness,
                        image: {
                            name: 'Grayscale',
                            amount: (grayscale != null)? grayscale: prevState.amountGrayScale,
                            image: {
                                name: presets[newPresetIndex].name,
                                amount: presets[newPresetIndex].amount,
                                image: <Image
                                    resizeMode={'contain'}
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        backgroundColor: 'black'
                                    }}
                                    source={{uri: this.state.imagePreview}}
                                />

                            }
                        }
                    }
                }
            };
        });
    }

    cancel() {
        this.props.onCancel();
    }

    changeContrast(value) {
        this.changeFilter(null, value);
    }

    changeBrightness(value) {
        this.changeFilter(null, null, value);
    }

    switchGrayscale() {
        let {amountGrayScale} = this.state;
        amountGrayScale = amountGrayScale == 1 ? 0 : 1;

        this.changeFilter(null, null, null, amountGrayScale);
    }

    closeCustomFilter() {
        let {configPreview, imagePreview, amountGrayScale} = this.state;
        configPreview = {
            name: 'Grayscale',
            amount: amountGrayScale,
            image: <Image
                resizeMode={'contain'}
                style={{
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'black'
                }}
                source={{uri: imagePreview}}
            />
        };
        this.setState((prevState) => {
            return {
                ...prevState,
                showCustomFilter: false
            };
        });
    }

    cropImage() {
        let {imageUri} = this.state;
        Image.getSize(imageUri, (width, height) => {
            ImagePicker.openCropper({
                path: imageUri,
                freeStyleCropEnabled: true,
                compressImageQuality: 1,
                width: width,
                height: height
            }).then(imageData => {
                this.setState({
                    imagePreview: imageData.path,
                    amountGrayScale: defaultAmountGrayScale,
                    amountBrightness: defaultAmountBrightness,
                    amountContrast: defaultAmountContrast,
                    configPreview: {
                        name: 'Grayscale',
                        amount: defaultAmountGrayScale,
                        image: <Image
                            resizeMode={'contain'}
                            style={{
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'black'
                            }}
                            source={{uri: imageData.path}}
                        />
                    }
                });
            }, (error => {
                console.warn(error);
            }));
        }, (error) => {
            console.warn(error);
        });
    }

    renderItem({index, item}) {
        let {amountGrayScale} = this.state;
        return (
            <TouchableOpacity
                onPress={ () => {
                    this.changeFilter(index);
                }}>
                <GenericImageFilter
                    config={{
                        name: 'Grayscale',
                        amount: amountGrayScale,
                        image:{
                            name: item.name,
                            amount: item.amount,
                            image: <Image
                                resizeMode={'cover'}
                                style={stylesImageFilter.presets}
                                source={{uri: this.state.imagePreview}}
                            />
                        }
                    }}
                    extractImageEnabled={false}
                    cleanExtractedImagesCache={true}
                />
                <View
                    style={stylesImageFilter.presetLabel}
                ><Text style={stylesImageFilter.presetTextLabel}>{item.name}</Text></View>
            </TouchableOpacity>
        );
    }

    keyExtractor = (item, index) => String(item.name);

    renderPresetFilters() {
        let {amountGrayScale} = this.state;
        return (
            <View style={{flex: 1, flexDirection: 'column'}}>
                <FlatList
                    style={{flex: 1, backgroundColor: Palette.black}}
                    data={this.state.presets}
                    renderItem={this.renderItem.bind(this)}
                    keyExtractor={this.keyExtractor}
                    horizontal={true}
                />
                <View style={{height: 55, marginTop: 0, flexDirection: 'row', justifyContent: 'space-around'}}>
                    <TouchableOpacity
                        style={{flexDirection: 'column', justifyContent: 'center'}}
                        onPress={ this.cropImage.bind(this)}>
                        <IconButton
                            style={{flexDirection: 'row', alignSelf: 'center'}}
                            size={20}
                            icon={'crop'}
                            color={Palette.light}
                        />
                        <Text
                            style={{color: Palette.light, fontSize: 10, alignSelf: 'center', marginTop: -5}}
                        >CROP</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{flexDirection: 'column', justifyContent: 'center'}}
                        onPress={this.switchGrayscale.bind(this)}>
                        <IconButton
                            style={{flexDirection: 'row', alignSelf: 'center'}}
                            size={20}
                            icon={'mine'}
                            color={amountGrayScale ? Palette.primary : Palette.light}
                        />
                        <Text style={{
                            color: amountGrayScale ? Palette.primary : Palette.light,
                            fontSize: 10,
                            alignSelf: 'center',
                            marginTop: -5
                        }}>GRAYSCALE</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={{flexDirection: 'column', justifyContent: 'center'}}
                        onPress={ () => {
                            this.setState({showCustomFilter: true});
                        }}>
                        <IconButton
                            style={{flexDirection: 'row', alignSelf: 'center'}}
                            size={20}
                            icon={'tune'}
                            color={Palette.light}
                        />
                        <Text style={{
                            color: Palette.light,
                            fontSize: 10,
                            alignSelf: 'center',
                            marginTop: -5
                        }}>CUSTOM</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    renderCustomFilters() {
        let {amountContrast, amountBrightness, showCustomContrast} = this.state;
        return (
            <View style={stylesImageFilter.sectionBottom}>
                <View style={{
                    flex: 2,
                    flexDirection: 'row',
                    paddingHorizontal: 20,
                }}>
                    {(showCustomContrast) ?
                        <View style={{flex: 1}}>
                            <Text style={[stylesImageFilter.textWhiteLabel]}>Contrast</Text>
                            <Slider
                                step={0.025}
                                maximumValue={1.5}
                                minimumValue={0.5}
                                maximumTrackTintColor={Palette.light}
                                thumbTintColor={Palette.primary}
                                minimumTrackTintColor={Palette.primary}
                                onValueChange={this.changeContrast.bind(this)}
                                value={(amountContrast)}
                            />
                        </View>
                        :
                        <View style={{flex: 1}}>
                            <Text style={stylesImageFilter.textWhiteLabel}>Brightness</Text>
                            <Slider
                                step={0.01}
                                maximumValue={1.5}
                                minimumValue={0.5}
                                maximumTrackTintColor={Palette.light}
                                thumbTintColor={Palette.primary}
                                minimumTrackTintColor={Palette.primary}
                                onValueChange={this.changeBrightness.bind(this)}
                                value={(amountBrightness)}
                            />
                        </View>
                    }
                </View>
                <View style={stylesImageFilter.menuCustomBottom}>
                    <TouchableHighlight
                        onPress={ this.closeCustomFilter.bind(this)}
                    >
                        <Text style={stylesImageFilter.textWhite}>Back</Text>
                    </TouchableHighlight>
                    <View/>
                    <TouchableHighlight
                        onPress={ () => {
                            this.setState({showCustomContrast: true});
                        }}>
                        <Text style={stylesImageFilter.textWhite}>Contrast</Text>
                    </TouchableHighlight>
                    <TouchableHighlight
                        onPress={ () => {
                            this.setState({showCustomContrast: false});
                        }}>
                        <Text style={stylesImageFilter.textWhite}>Brightness</Text>
                    </TouchableHighlight>
                </View>
            </View>
        );
    }

    render() {
        return (
            <SafeAreaView style={{flex: 1, flexDirection: 'column', backgroundColor: Palette.black}}>
                <GenericImageFilter
                    style={{flex: 5, backgroundColor: Palette.danger}}
                    config={this.state.configPreview}
                    extractImageEnabled={true}
                    onExtractImage={({nativeEvent}) => {
                        this.setState({imageUri: nativeEvent.uri});
                    }}
                    cleanExtractedImagesCache={true}
                />

                <View style={{position: 'absolute', top:0, left: 0, right:0}}>
                    <FAB style={[stylesImageFilter.fab, {left: 20}]}
                         small
                         color="white"
                         icon={'close'}
                         onPress={ () => {
                             this.cancel();
                         }}
                    />
                    <FAB style={[stylesImageFilter.fab, {right: 20}]}
                         small
                         icon={'check'}
                         onPress={ () => {
                             this.applyFilter()
                         } }
                    />
                </View>

                {
                    (this.state.showCustomFilter) ?
                        this.renderCustomFilters(this)
                        :
                        this.renderPresetFilters(this)

                }


            </SafeAreaView>
        )
    }
}
const stylesImageFilter = StyleSheet.create({
    fab: {
        position: "absolute",
        zIndex: 10,
        top: 30,
        backgroundColor: Palette.primary,
    },
    menuCustomBottom: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        margin: 5,
    },
    textWhite: {
        paddingHorizontal: 15,
        height: '100%',
        textAlignVertical: 'center',
        fontSize: 16,
        color: Palette.light,
    },
    textWhiteLabel: {
        textAlign: 'center',
        marginBottom: 20,
        fontSize: 16,
        color: Palette.light,
    },
    sectionBottom: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: Palette.black,
        justifyContent: 'space-between'
    },
    presets: {
        marginHorizontal: 2,
        width: 100,
        height: 100,
        backgroundColor: Palette.black
    },
    presetLabel: {
        alignSelf: 'center',
        position: 'absolute',
        zIndex: 3,
        top: 0,
        backgroundColor: Palette.dark,
        width: '100%',
        opacity: 0.5,
        height: 15
    },
    presetTextLabel: {
        textAlign: 'center',
        margin: 0,
        textTransform: 'uppercase',
        fontSize: 10,
        color: Palette.light
    }
});
export default withTheme(ImageFilter);