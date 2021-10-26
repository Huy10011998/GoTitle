import {DefaultTheme} from 'react-native-paper';

const Palette = {
    primary: "#006eaf",
    secondary: "#7293BC",
    button: "#4169e1",
    accent: "#00D2A5",
    light: "#fff",
    dark: "#000",
    gray: "#eee",
    darkGray: "#696969",
    lightGray: "#d2d2d2",
    graytextinput: "#696969",
    success: "#007C32",
    successLight: "#00cb2e",
    danger: "#BB3C3F",
    warning: "#DF9F1F",
    info: "#0093C5",
    aqua: "#A2CADF",
    black: '#000'
};

const IconPalette = [
    "#DF9F1F",
    "#6CC482",
    "#809DFF",
    "#C1E874",
    "#7490E8",
    "#A87054",
    "#FFB149",
    "#827299",
    "#007C32",
];

const Theme = {
    ...DefaultTheme,
    roundness: 2,
    dark: false,
    colors: {
        ...DefaultTheme.colors,
        primary: Palette.primary,
        accent: Palette.accent,
        surface: Palette.light,
        placeholder: Palette.secondary,
        text: Palette.dark,
        error: Palette.danger,
    },
    formDatePicker: {
        dateInput: {
            borderRadius: 0,
            backgroundColor: 'transparent',
            borderColor: Palette.gray,
            borderWidth: 0,
            borderBottomWidth: 1,
            alignItems: 'flex-start',
        },
        dateText: {
            color: Palette.dark,
            marginLeft:15,
        },
        placeholderText: {
            color: Palette.secondary,
            marginLeft:10,
            fontsize:16,
        }
    },
    formGooglePlace: {
        textInputContainer: {
            // backgroundColor: 'transparent',
            // marginLeft: 10,
            // borderRadius: 12,
            // borderWidth: 1,
            // height: 50,
            borderColor: Palette.primary,
            // marginTop: 10
        },
        textInput: {
            marginLeft: 0,
            marginRight: 0,
            height: 38,
            color: Palette.dark,
        },
    }
};

export {
    Palette,
    IconPalette,
    Theme
};