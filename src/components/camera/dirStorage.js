import { Platform } from 'react-native';
const RNFS = require('react-native-fs');

export const dirHome = Platform.select({
    ios: `${RNFS.DocumentDirectoryPath}/GoTitle`,
    android: `${RNFS.ExternalStorageDirectoryPath}/GoTitle`
});

export const dirPictures = `${dirHome}/Pictures`;