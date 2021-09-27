import AsyncStorage from "@react-native-community/async-storage";

export const USER_TOKEN = 'user-token';

export const onSignIn = () => AsyncStorage.setItem(USER_TOKEN, "true");

export const onSignOut = () => AsyncStorage.removeItem(USER_TOKEN);

export const isSignedIn = () => {
  return new Promise((resolve, reject) => {
    AsyncStorage.getItem(USER_TOKEN).then(
      res => {
        if (res !== null) {
          resolve(true);
        } else {
          resolve(false);
        }
      }).catch(err => reject(err));
  })
};