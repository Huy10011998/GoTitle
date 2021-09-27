import { Platform } from 'react-native';
import RNFS from "react-native-fs";

export const dirHome = Platform.select({
    ios: `${RNFS.LibraryDirectoryPath}/GoTitle`,
    android: `${RNFS.ExternalStorageDirectoryPath}/GoTitle`
});

export const dirPictures = `${dirHome}/Pictures`;

export const dirHomeRelative = "GoTitle/";

export const generatePathHome = (title)=>{
    "use strict";
    return dirHome+'/title_'+title.id+'/';
};
export const generatePathHomeImages = (title)=>{
    "use strict";
    return dirHome+'/title_'+title.id+'/Images/';
};
export const generateCompletePathHomeImages = (title)=>{
    "use strict";
    let path= dirHome+'/title_'+title.id+'/Images/';
    return path;
};
