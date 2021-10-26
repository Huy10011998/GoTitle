import React from "react";
import {
    createSwitchNavigator,
    createAppContainer as rnCreateAppContainer,
} from "react-navigation";
import {createDrawerNavigator} from "react-navigation-drawer"
import {createStackNavigator} from "react-navigation-stack";
import {Palette} from 'src/Style/app.theme';

import CustomDrawerContentComponent from 'src/components/navigation/customDrawerContent';

import Login from 'src/components/auth/login';
import SignUp from 'src/components/auth/register';

import TitleList from 'src/components/title/titleList';

import OrderForm from 'src/components/titleForm/basicInfo/OrderForm';
import LegalDescriptionForm from 'src/components/titleForm/description/LegalDescriptionForm';
import MortgageForm from 'src/components/titleForm/mortgage/MortgageForm';
import DeedForm from 'src/components/titleForm/deed/DeedForm';
import LienForm from 'src/components/titleForm/lien/LienForm';
import PlatFloorForm from 'src/components/titleForm/platFloorPlan/PlatFloorPlanForm';
import EasementForm from 'src/components/titleForm/easement/EasementForm';
import MiscCivilProbateForm from 'src/components/titleForm/miscCivilProbate/MiscCivilProbateForm';
import TaxForm from 'src/components/titleForm/tax/TaxForm';


import NotesForm from 'src/components/titleForm/note/NotesForm';
import PublishForm from 'src/components/titleForm/publish/PublishForm';
import ChooseADocument from 'src/components/titleForm/chooseADocument/chooseADocument';
import CovenantsForm from 'src/components/titleForm/covenant/CovenantsForm';
import DoubleCheck from 'src/components/titleForm/doubleCheck/DoubleCheck';

import TitleInfo from 'src/components/title/TitleInfo';

import TitleDescription from 'src/components/title/detail/titleDetail';
import TitleCovenant from 'src/components/title/detail/titleCovenant';
import TitleNote from 'src/components/title/detail/titleNote';

import ForgotPassword from 'src/components/forgotPassword/forgotPassword';
import StartScreen from 'src/components/startScreen/startScreen';
import ContinueTitle from 'src/components/continueTitle/continueTitle';
import BuildMyTitle from 'src/components/BuildMyTitle/buildMyTitle';

import ImageGallery from 'src/components/reusable/imageGallery';
import ImageViewer from 'src/components/reusable/ImageViewer';
import Camera from 'src/components/reusable/camera';
import style from "react-native-datepicker/style";

const AuthNavigator = createStackNavigator(
    {
        Login: {
            screen: Login,
            navigationOptions: {}
        },
        SignUp: {
            screen: SignUp,
            navigationOptions: {}
        },
        ForgotPassword: {
            screen: ForgotPassword,
            navigationOptions: {}
        },
    }, 
    {
        initialRouteName: 'Login',
        headerMode: 'none',
        navigationOptions: {
            headerBackTitleVisible: false
        }
    }
);

const TitleNavigator = createStackNavigator(
    {
        TitleList: {
            screen: TitleList,
            navigationOptions: {
                headerShown: false
            },
        },
        TitleDetail: {
            screen: TitleInfo,
            navigationOptions: {
                title: "Title Details"
            }
        },
        Mortgage: {
            screen: MortgageForm,
            navigationOptions: {
                title: 'Mortgages'
            }
        },
        LegalDescriptionForm: {
            screen: LegalDescriptionForm,
            navigationOptions: {
                title: 'Legal Description'
            }
        },
        PlatFloorForm: {
            screen: PlatFloorForm,
            navigationOptions: {
                title: 'Plat / Floor Plans'
            }
        },
        DeedForm: {
            screen: DeedForm,
            navigationOptions: {
                title: 'Chain Of Title'
            }
        },
        CovenantsForm: {
            screen: CovenantsForm,
            navigationOptions: {
                title: 'Protective Covenants'
            }
        },
        EasementForm: {
            screen: EasementForm,
            navigationOptions: {
                title: 'Easements'
            }
        },
        MiscCivilProbateForm: {
            screen: MiscCivilProbateForm,
            navigationOptions: {
                title: 'Misc | Civil | Probate'
            }
        },
        TaxForm: {
            screen: TaxForm,
            navigationOptions: {
                title: 'Misc | Civil | Probate'
            }
        },
        LienForm: {
            screen: LienForm,
            navigationOptions: {
                title: 'Liens'
            }
        },
        NotesForm: {
            screen: NotesForm,
            navigationOptions: {
                title: 'Notes'
            }
        },
        PublishForm: {
            screen: PublishForm,
            navigationOptions: {
                title: 'Name your Price'
            }
        },
        StartScreen: {
            screen: StartScreen,
            navigationOptions: {
                title:'Go Title'
            }
        },
        NewTitle: {
            screen: OrderForm,
            navigationOptions: {
                title: "Order Form",
            },       
        },
        continueTitle: {
            screen: ContinueTitle,
            navigationOptions: {
                title: "Continue a Title"
            }
        },
        ChooseADocument: {
            screen: ChooseADocument,
            navigationOptions: {
                title: "Choose a Document"
            }
        },

        imageGallery: {
            screen: ImageGallery,
            navigationOptions: {
                title: "Images"
            }
        },
        ImageViewer: {
            screen: ImageViewer,
            navigationOptions: {
                headerShown: false
            }
        },
        DoubleCheck: {
            screen: DoubleCheck,
            navigationOptions: {
                title: "Double Check!"
            }
        },
        BuildMyTitle: {
            screen: BuildMyTitle,
            navigationOptions: {
                title: "Build My Title"
            }
        },
        camera: {
            screen: Camera,
            navigationOptions: {
                headerShown: false
            }
        },

        TitleDescription: TitleDescription,
        TitleCovenant: TitleCovenant,
        TitleNote: TitleNote,

    }, 
    {
        initialRouteName: 'StartScreen',
        defaultNavigationOptions: {
            headerStyle: {
                backgroundColor: Palette.primary,
            },
            headerTitleStyle: {},
            headerTintColor: Palette.light,
            headerBackTitle: "Back",
        }
    }
);

const AppNavigator = createDrawerNavigator(
    {
        Home: {
            screen: TitleNavigator,
        },
    }, {
        contentComponent: CustomDrawerContentComponent,
        initialRouteName: 'Home'
    }
);

export const createAppContainer = (signedIn = false) => {
    //TODO: add a auth loading component to manage the auth state.
    const RootNavigator = createSwitchNavigator(
        {
            AuthNav: {
                screen: AuthNavigator
            },
            AppNav: {
                screen: AppNavigator
            },
        },
        {
            initialRouteName: signedIn ? "AuthNav" : "AppNav"
        }
    );

    return rnCreateAppContainer(RootNavigator);
};