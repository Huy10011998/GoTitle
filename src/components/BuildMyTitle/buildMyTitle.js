import React, {Component} from 'react';
import {NavigationEvents} from 'react-navigation';
import {View, StyleSheet, TouchableOpacity, SafeAreaView, ScrollView, ActivityIndicator,RefreshControl} from 'react-native';
import {Text, Card, Button, Searchbar, IconButton, List} from 'react-native-paper';
import {styles} from 'src/Style/app.style';
import {Palette} from 'src/Style/app.theme';
import {getManager, getConnection, getCustomRepository} from 'typeorm';
import {
    Title,
    TitleDetail,
    Mortgage,
    Deed
} from 'src/entities/index';
import {
    TitleBuyerRepository,
    TitleSellerRepository,
    TitleBookPageRepository,
    DeedRepository,
    MortgageRepository,
    LienRepository,
    PlatFloorPlanRepository,
    EasementRepository,
    MiscCivilProbateRepository,
    TaxRepository,
    CovenantRepository,
    DbImageRepository
} from 'src/repositories/index';
import SyncService from 'src/services/SyncService';

export default class BuildMyTitle extends Component {
    constructor(props) {
        super(props);

        this.titleBuyerRepository = getCustomRepository(TitleBuyerRepository);
        this.titleSellerRepository = getCustomRepository(TitleSellerRepository);
        this.titleBookPageRepository = getCustomRepository(TitleBookPageRepository);
        this.deedRepository = getCustomRepository(DeedRepository);
        this.mortgageRepository = getCustomRepository(MortgageRepository);
        this.lienRepository = getCustomRepository(LienRepository);
        this.platFloorPlanRepository = getCustomRepository(PlatFloorPlanRepository);
        this.easementRepository = getCustomRepository(EasementRepository);
        this.miscCivilProbateRepository = getCustomRepository(MiscCivilProbateRepository);
        this.taxRepository = getCustomRepository(TaxRepository);
        this.covenantRepository = getCustomRepository(CovenantRepository);
        this.dbImageRepository = getCustomRepository(DbImageRepository);
        this.manager = getManager();
        this.connection = getConnection();

        let isResetNavigation = props.navigation.getParam('isResetNavigation', false);
        let title = props.navigation.getParam('title', {});
        let titleDetail = props.navigation.getParam('titleDetail', {isOpenSection: false});
        this.syncService = new SyncService();
        this.state = {
            cloudRefreshing: false,
            title: {...title},
            titleDetail: {...titleDetail},
            isShowSearchBar: false,
            searchText: '',
            list: [],
            documentList: [],
            tmpDocumentList: [],
            keyNavigation: [
                {
                    docType: 'deed',
                    navigateKey: 'DeedForm',
                    name: 'deed',
                },
                {
                    docType: 'mortgage',
                    navigateKey: 'Mortgage',
                    name: 'mortgage'
                },
                {
                    docType: 'lien',
                    navigateKey: 'LienForm',
                    name: 'lien'
                },
                {
                    docType: 'plat_floor_plan',
                    navigateKey: 'PlatFloorForm',
                    name: 'platFloorPlan'
                },
                {
                    docType: 'easement',
                    navigateKey: 'EasementForm',
                    name: 'easement'
                },
                {
                    docType: 'lease',
                    navigateKey: 'EasementForm',
                    name: 'easement'
                },
                {
                    docType: 'misc_civil_probate',
                    navigateKey: 'MiscCivilProbateForm',
                    name: 'miscCivilProbate'
                },
                {
                    docType: 'tax',
                    navigateKey: 'TaxForm',
                    name: 'tax'
                }],
            currentOwnerDeed: [],
            deedList: [],
            mortgageList: [],
            liensList: [],
            platFloorPlansList: [],
            easementsList: [],
            taxList: [],
            miscCivilProbatesList: []

        };

        this.showSearchBar = this.showSearchBar.bind(this);
        this.props.navigation.setParams({showSearchBar: this.showSearchBar});
    };

    static navigationOptions = ({navigation}) => {
        return {
            headerRight: () =>
                <IconButton
                    icon="magnify" color="white" size={30}
                    onPress={ navigation.getParam('showSearchBar') }
                />
            ,
        }
    };

    componentDidMount() {
        this.loadDocumentList();
    }

    async loadToCloud() {
        if (this.state.title.apiId) {
            this.setState({cloudRefreshing: true});
            let localBuyerList = await this.titleBuyerRepository.find({title: {id: this.state.title.id}});
            await this.syncService.syncList(this.titleBuyerRepository, localBuyerList, [this.state.title]);

            let localSellerList = await this.titleSellerRepository.find({title: {id: this.state.title.id}});
            await this.syncService.syncList(this.titleSellerRepository, localSellerList, [this.state.title]);

            let localBookPageList = await this.titleBookPageRepository.find({title: {id: this.state.title.id}});
            await this.syncService.syncList(this.titleBookPageRepository, localBookPageList, [this.state.title]);

            let localDocumentList = await this.deedRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType']});
            await this.syncService.syncList(this.deedRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.mortgageRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType','masterDocument','dbImageList','title']});
            await this.syncService.syncList(this.mortgageRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.lienRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType','masterDocument']});
            await this.syncService.syncList(this.lienRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.platFloorPlanRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType','masterDocument']});
            await this.syncService.syncList(this.platFloorPlanRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.easementRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType']});
            await this.syncService.syncList(this.easementRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.miscCivilProbateRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType']});
            await this.syncService.syncList(this.miscCivilProbateRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.taxRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType']});
            await this.syncService.syncList(this.taxRepository, localDocumentList, [this.state.title]);

            localDocumentList = await this.covenantRepository.find({where:{title: {id: this.state.title.id}},relations:['deedType','masterDocument']});
            await this.syncService.syncList(this.covenantRepository, localDocumentList, [this.state.title]);

            this.setState({cloudRefreshing:false});
        }
        await this.loadDocumentList();
        return;
    }

    showSearchBar() {
        this.setState((prevState) => {
            return {
                ...prevState,
                isShowSearchBar: !prevState.isShowSearchBar
            }
        })
    }

    async loadDocumentList() {
        if (!this.connection.isConnected)
            await this.connection.connect();

        this.state.deedList = [];
        this.state.miscCivilProbatesList = [];
        this.state.easementsList = [];
        this.state.deedList = [];
        this.state.mortgageList = [];
        this.state.taxList = [];
        this.state.platFloorPlansList = [];
        let titleDetail = await this.manager.findOne(TitleDetail, {
            where: {title: this.state.title},
            relations: ['title']
        });

        if (titleDetail != null) {
            if (titleDetail.isOpenSection == null)
                titleDetail.isOpenSection = false;
        }

        this.setState({titleDetail: titleDetail});

        let documentList = [];
        let documentSec = [];
        let relationDocTypes = ['deedList', 'mortgageList', 'lienList', 'easementList', 'miscCivilProbateList', 'platFloorPlanList', 'taxList'];
        for (const relationDocType of relationDocTypes) {
            let param1;
            let param2;
            let order;
            switch (relationDocType) {
                case 'deedList':
                    param1 = relationDocType + '.' + 'deedType.id';
                    param2 = relationDocType + '.' + 'deedType';
                    order = 'DESC';
                    break;
                case 'taxList':
                    param1 = relationDocType + '.' + 'datePaid';
                    param2 = relationDocType + '.' + 'municipalDatePaid';
                    order = 'ASC';
                    break;
                default:
                    param1 = relationDocType + '.' + 'deedType.id';
                    param2 = relationDocType + '.' + 'deedType';
                    order = 'ASC';
            }

            let titleMasterDoc = await this.connection.getRepository(Title)
                .createQueryBuilder('title')
                .leftJoinAndSelect('title.' + relationDocType, relationDocType)
                .leftJoinAndSelect(relationDocType + '.deedType', 'deedType')
                .where('deedType.scope = "master"')
                .andWhere('deedType.docType != "covenant"')
                .andWhere('title.id = ' + this.state.title.id)
                .orderBy(param1, order)
                .addOrderBy(param2, order)
                .getOne();

            if (titleMasterDoc != null) {
                for (const doc of titleMasterDoc[relationDocType]) {
                    documentList.push(doc);
                    if (['mortgageList', 'lienList', 'platFloorPlanList'].indexOf(relationDocType) >= 0) {
                        let titleSecDoc = await this.connection.getRepository(Title)
                            .createQueryBuilder('title')
                            .leftJoinAndSelect('title.' + relationDocType, relationDocType)
                            .leftJoinAndSelect(relationDocType + '.deedType', 'deedType')
                            .leftJoinAndSelect(relationDocType + '.masterDocument', 'masterDocument')
                            .leftJoinAndSelect('masterDocument.deedType', 'deedTypeM')
                            .where('deedType.scope = "secondary"')
                            .andWhere('title.id = ' + this.state.title.id)
                            .andWhere(relationDocType + '.masterDocumentId = ' + doc.id)
                            .orderBy(param1, order)
                            .addOrderBy(param2, order)
                            .getOne();
                        if (titleSecDoc != null)
                            documentSec = documentSec.concat(titleSecDoc[relationDocType]);

                    }
                }
            }
        }

        let deedList = [];
        let mortgageList = [];
        let lienList = [];
        let platFloorPlanList = [];
        let easementsList = [];
        let miscCivilProbatesList = [];
        let taxList = [];
        let allDocument = [];

        if (documentList != null) {
            documentList.forEach(async (allDocument) => {
                if (allDocument.deedType.docType === 'tax') {
                    taxList.push(allDocument);
                } else if (allDocument.deedType.docType === 'mortgage') {
                    mortgageList.push(allDocument);
                } else if (allDocument.deedType.docType === 'deed') {
                    deedList.push(allDocument);
                } else if (allDocument.deedType.docType === 'easement' || allDocument.deedType.docType === 'lease') {
                    easementsList.push(allDocument);
                } else if (allDocument.deedType.docType === 'misc_civil_probate') {
                    miscCivilProbatesList.push(allDocument);
                } else if (allDocument.deedType.docType === 'plat_floor_plan') {
                    platFloorPlanList.push(allDocument);
                } else if (allDocument.deedType.docType === 'lien') {
                    lienList.push(allDocument);
                }
            });
        }

        if (deedList != null && deedList.length > 0) {
            deedList = this.sortDocuments(deedList).slice().reverse();
            allDocument = allDocument.concat(deedList);
        }

        let mortgageListSecondary = [];
        let lienListSecondary = [];
        let platFloorPlanListSecondary = [];
        let mortgageDocs = [];
        let lienDocs = [];
        let platFloorPlanDocs = [];

        this.setState({documentList: [], tmpDocumentList: []});

        if (documentSec != null && documentSec.length > 0) {
            documentSec.forEach(async (documentSecondary) => {
                if (documentSecondary.deedType.docType == 'mortgage') {
                    mortgageListSecondary.push(documentSecondary);
                } else {
                    if (documentSecondary.deedType.docType == 'lien') {
                        lienListSecondary.push(documentSecondary);
                    } else {
                        platFloorPlanListSecondary.push(documentSecondary);
                    }
                }
            });
        }

        if (mortgageList != null && mortgageList.length > 0) {
            mortgageList = this.sortDocuments(mortgageList);
            mortgageListSecondary = this.sortDocuments(mortgageListSecondary);
            for (let documentMaster of mortgageList) {
                mortgageDocs.push(documentMaster);
                if (mortgageListSecondary.length > 0)
                    for (let mortgage of mortgageListSecondary) {
                        if (documentMaster.id === mortgage.masterDocument.id) {
                            mortgageDocs.push(mortgage);
                        }
                    }
            }
            allDocument = allDocument.concat(mortgageDocs);
        }

        if (lienList != null && lienList.length > 0) {
            lienList = this.sortDocuments(lienList);
            lienListSecondary = this.sortDocuments(lienListSecondary);
            lienList.forEach(async (documentMaster) => {
                lienDocs.push(documentMaster);
                lienListSecondary.forEach(async (lien) => {
                    if (documentMaster.id === lien.masterDocument.id) {
                        lienDocs.push(lien);
                    }
                });
            });
            allDocument = allDocument.concat(lienDocs);
        }

        if (platFloorPlanList != null && platFloorPlanList.length > 0) {
            platFloorPlanList = this.sortDocuments(platFloorPlanList);
            platFloorPlanListSecondary = this.sortDocuments(platFloorPlanListSecondary);
            platFloorPlanList.forEach(async (documentMaster) => {
                platFloorPlanDocs.push(documentMaster);
                if (platFloorPlanListSecondary.length > 0) {
                    platFloorPlanListSecondary.forEach(async (platFloorPlan) => {
                        if (documentMaster.id === platFloorPlan.masterDocument.id) {
                            platFloorPlanDocs.push(platFloorPlan);
                        }
                    });
                }
            });
            allDocument = allDocument.concat(platFloorPlanDocs);
        }

        if (easementsList != null && easementsList.length > 0)
            allDocument = allDocument.concat(this.sortDocuments(easementsList));

        if (miscCivilProbatesList != null && miscCivilProbatesList.length > 0)
            allDocument = allDocument.concat(this.sortDocuments(miscCivilProbatesList));

        if (taxList != null && taxList.length > 0)
            allDocument = allDocument.concat(taxList);

        this.setState({documentList: allDocument, tmpDocumentList: allDocument});

        let title = await this.manager.findOne(Title, {
            where: {id: this.state.title.id}
        });

    }

    sortDocuments(documentList) {
        if (documentList != null && documentList.length > 0) {
            let documentListMapped = [];
            if (documentList[0].deedType.docType == 'mortgage' || documentList[0].deedType.docType == 'easement'
                || documentList[0].deedType.docType == 'lease' || documentList[0].deedType.docType == 'deed'
                || documentList[0].deedType.docType == 'covenant') {
                documentListMapped = documentList.map(function (doc, i) {

                    if (doc.deedBook != null && doc.deedPage != null) {
                        return {
                            index: i, valueBook: doc.deedBook.toUpperCase(), valuePage: doc.deedPage.toUpperCase(),
                            docType: doc.deedType.code
                        };
                    } else {
                        if (doc.deedBook != null && doc.deedPage == null) {
                            return {
                                index: i, valueBook: doc.deedBook.toUpperCase(), valuePage: null,
                                docType: doc.deedType.code
                            };
                        } else {
                            if (doc.deedBook == null && doc.deedPage != null) {
                                return {
                                    index: i, valueBook: null, valuePage: doc.deedPage.toUpperCase(),
                                    docType: doc.deedType.code
                                };
                            } else {
                                return {index: i, value: doc}
                            }
                        }
                    }
                });
            }
            if (documentList[0].deedType.docType == 'lien' || documentList[0].deedType.docType == 'misc_civil_probate') {
                documentListMapped = documentList.map(function (doc, i) {

                    if (doc.book != null && doc.page != null) {
                        return {
                            index: i, valueBook: doc.book.toUpperCase(), valuePage: doc.page.toUpperCase(),
                            docType: doc.deedType.code
                        };
                    } else {
                        if (doc.book != null && doc.page == null) {
                            return {
                                index: i, valueBook: doc.book.toUpperCase(), valuePage: null,
                                docType: doc.deedType.code
                            };
                        } else {
                            if (doc.book == null && doc.page != null) {
                                return {
                                    index: i, valueBook: null, valuePage: doc.page.toUpperCase(),
                                    docType: doc.deedType.code
                                };
                            } else {
                                return {index: i, value: doc}
                            }
                        }
                    }
                });
            }
            if (documentList[0].deedType.docType == 'plat_floor_plan') {
                documentListMapped = documentList.map(function (doc, i) {
                    if (doc.platBook != null && doc.platPage != null) {
                        return {
                            index: i, valueBook: doc.platBook.toUpperCase(), valuePage: doc.platPage.toUpperCase(),
                            docType: doc.deedType.code
                        };
                    } else {
                        if (doc.platBook != null && doc.platPage == null) {
                            return {
                                index: i, valueBook: doc.platBook.toUpperCase(), valuePage: null,
                                docType: doc.deedType.code
                            };
                        } else {
                            if (doc.platBook == null && doc.platPage != null) {
                                return {
                                    index: i, valueBook: null, valuePage: doc.platPage.toUpperCase(),
                                    docType: doc.deedType.code
                                };
                            } else {
                                return {index: i, value: doc}
                            }
                        }
                    }
                });
            }

            documentListMapped.sort((a, b) => {
                if (a.valueBook != null) {
                    if (b.valueBook != null) {
                        if (this.compareLessThan(a.valueBook, b.valueBook) > 0) {
                            return -1;
                        }
                        if (this.compareLessThan(a.valueBook, b.valueBook) < 0) {
                            return 1;
                        }
                        if (a.valuePage != null) {
                            if (b.valuePage != null) {
                                if (this.compareLessThan(a.valuePage, b.valuePage) > 0) {
                                    return -1;
                                }
                                if (this.compareLessThan(a.valuePage, b.valuePage) < 0) {
                                    return 1;
                                }
                                return 0;
                            }
                            return 0;
                        }
                        return 0;
                    }
                    return 0;
                }
                return 0;
            });
            let documentListSorted = documentListMapped.map(function (doc) {
                return documentList[doc.index];
            });

            return documentListSorted;
        }
        return [];

    }

    extractLetters(text) {
        for (let i = 0; text.length >= i; i++) {
            if (!isNaN(text.charAt(i))) {
                return text.substr(0, i);
            }
        }
        return '';
    };

    extractNumbers(str) {
        let numbersList = str.match(/\d+/);
        if (numbersList == null || numbersList.length == 0)
            return undefined;
        return numbersList[0];
    };

    partitionWord(txt) {
        let wordList = [];
        while (txt.length > 0) {
            if (isNaN(txt.charAt(0))) { //letters
                let word = this.extractLetters(txt);
                txt = txt.slice(word.length);
                wordList.push(word);
            } else {
                let numberTxt = this.extractNumbers(txt);
                txt = txt.slice(numberTxt.length);
                wordList.push(numberTxt);
            }
        }
        return wordList;
    };

    compareLessWord(wordA, wordB) {
        if (wordA.length < wordB.length) {
            return 1;
        }
        if (wordA.length > wordB.length) {
            return -1;
        }
        let result = 0;
        for (const [index, charA] of wordA.split('').entries()) {
            let charB = wordB.charAt(index);
            let compareResult = this.compareLessChar(charA, charB);
            if (compareResult != 0) {
                return compareResult;
            }
        }
        return result;
    };

    compareLessChar(charA, charB) {
        if (isNaN(charA) && isNaN(charB)) {
            if (charA.charCodeAt(0) < charB.charCodeAt(0))
                return 1;
            if (charA.charCodeAt(0) > charB.charCodeAt(0))
                return -1;
            return 0;
        } else {
            if (isNaN(charA))
                return 1;
            if (isNaN(charB))
                return -1;

            if (charA.charCodeAt(0) < charB.charCodeAt(0))
                return 1;
            if (charA.charCodeAt(0) > charB.charCodeAt(0))
                return -1;
            return 0;
        }

    };

    compareLessThan(strA, strB) {
        let partitionA = this.partitionWord(strA);
        let partitionB = this.partitionWord(strB);
        let lessSize = partitionA.length;
        if (lessSize > partitionB.length) lessSize = partitionB.length;
        let index = 0;
        let result = 0;
        while (index < lessSize) {
            let partA = partitionA[index];
            let partB = partitionB[index];
            if (isNaN(partA) && !isNaN(partB))
                result = 1;

            if (!isNaN(partA) && isNaN(partB))
                result = -1;

            if (isNaN(partA) && isNaN(partB))//both letters
                result = this.compareLessWord(partA, partB);

            if (!isNaN(partA) && !isNaN(partB)) { //both numbers
                if (parseInt(partA) < parseInt(partB))
                    result = 1;
                if (parseInt(partA) > parseInt(partB))
                    result = -1;
            }

            if (result == 0)
                index++;
            else break;
        }
        if (result == 0) {
            if (partitionA.length < partitionB.length)
                result = 1;
            if (partitionA.length > partitionB.length)
                result = -1;
        }
        return result;
    };

    navigate(document) {
        const {keyNavigation} = this.state;
        let routeObj = {name: undefined, navigateKey: ''};
        keyNavigation.forEach((item) => {
            if (item.docType === document.deedType.docType) {
                routeObj = item;
            }
        });

        let param = {
            title: {...this.state.title},
            deedType: {...document.deedType},
        };
        param[routeObj.name] = document;
        this.state.documentList = [];
        this.state.tmpDocumentList = [];
        this.props.navigation.navigate(routeObj.navigateKey, param);

    }

    searchDocument(text) {
        this.setState({
            searchText: text
        });
        if (text.length === 0) {
            this.setState({documentList: this.state.tmpDocumentList});
        } else {
            const docList = this.state.tmpDocumentList;
            const newList = docList.filter(item => {
                let itemData = '';
                if (item.deedType.docType === 'tax') {
                    itemData = (`${item.deedType.name} ` +
                    `${item.county} ` + `${item.taxpayerName} `);
                } else if (item.deedType.docType === 'plat_floor_plan') {
                    itemData = (`${item.deedType.name} ` +
                    `${item.platBook} ` + `${item.platPage} ` +
                    `${item.withoutBookPageInfo} `);
                } else if (item.deedType.docType === 'misc_civil_probate') {
                    itemData = (`${item.deedType.name} ` +
                    `${item.book} ` + `${item.page} ` +
                    `${item.fileNumber} ` + `${item.instrumentType} `);
                } else if (item.deedType.docType === 'lien') {
                    itemData = (`${item.deedType.name} ` +
                    `${item.book} ` + `${item.page} ` +
                    `${item.lienor} ` + `${item.debtor} `);
                } else {
                    itemData = (`${item.deedType.name} ` +
                    `${item.book} ` + `${item.page} ` +
                    `${item.grantor} ` + `${item.grantee} `);
                }
                const textData = String(text).toLowerCase();
                itemData = String(itemData).toLowerCase();

                return itemData.indexOf(textData) > -1;
            });
            this.setState((prevState) => {
                return {...prevState, documentList: newList};
            });
        }
    };

    render() {
        const {title, titleDetail} = this.state;
        return (
            <SafeAreaView style={{flex: 1}}>
                <NavigationEvents
                    onDidFocus={payload => this.loadToCloud()}
                />
                {
                    (this.state.isShowSearchBar) ?
                        <Searchbar
                            placeholder="Search your document..."
                            onChangeText={query => this.searchDocument(query)}
                            value={ this.state.searchText }
                            onIconPress={() => {
                                this.showSearchBar()
                            }}
                        />
                        : null
                }
                <View style={styles.containerFlat}>
                    <View style={{flexDirection: "row", justifyContent: 'space-between', marginVertical: 5}}>

                        <Card style={[styles.card, stylesBuildMyTitle.card]}>
                            <Card.Content>
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate('NewTitle', {
                                        title: {...this.state.title},
                                        titleDetail: {...this.state.titleDetail},
                                        isResetNavigation: true,
                                    })}
                                >
                                    <View>
                                        <Text style={stylesBuildMyTitle.formTextTitle}>
                                            Order Form
                                        </Text>
                                        {(title.location && title.location.district != null) ?
                                            <View>
                                                <Text style={stylesBuildMyTitle.formTextContent}>
                                                    {title.location.district} {( title.location.district.toLowerCase().indexOf('county') < 0) ? 'County' : null}
                                                </Text>
                                                <Text style={stylesBuildMyTitle.formTextContent}>
                                                    {title.location.name}
                                                </Text>
                                            </View> :
                                            <View style={{flexDirection: "row"}}>
                                                <Text
                                                    style={stylesBuildMyTitle.formTextContent}> {title.location?title.location.name || 'XXX':''} </Text>
                                                <Text style={stylesBuildMyTitle.formTextContent}>
                                                    County
                                                </Text>
                                            </View>
                                        }

                                        {(title.searchTypeDetail !== 'currentOwner' && title.searchTypeDetail !== 'update') ?
                                            <View>
                                                <Text style={stylesBuildMyTitle.formTextContentCapitalize}>
                                                    {(title.searchType)} {title.searchTypeDetail}
                                                </Text>
                                                <Text style={stylesBuildMyTitle.formTextContent}>
                                                    {title.searchTypeDetailValue}YR
                                                </Text>
                                            </View>
                                            :
                                            null
                                        }
                                    </View>
                                </TouchableOpacity>
                            </Card.Content>
                        </Card>

                        <Card style={ [styles.card, stylesBuildMyTitle.card] }>
                            <Card.Content >
                                <TouchableOpacity
                                    onPress={() => this.props.navigation.navigate('LegalDescriptionForm', {
                                        title: {...this.state.title},
                                        titleDetail: {...this.state.titleDetail}
                                    })}
                                >
                                    <View>
                                        <Text style={stylesBuildMyTitle.formTextTitle}>
                                            Legal Description
                                        </Text>
                                        {

                                            (titleDetail == null || titleDetail.isOpenSection == null || !titleDetail.isOpenSection) ?
                                                <View>
                                                    <Text
                                                        style={stylesBuildMyTitle.formTextContent}>
                                                        District: {title.district}</Text>
                                                    <Text style={stylesBuildMyTitle.formTextContent}>
                                                        LandLot: {title.landLot}</Text>
                                                    <View
                                                        style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                                                        {
                                                            (title.lot !== null) ?
                                                                <Text style={stylesBuildMyTitle.formTextContent}>
                                                                    Lot: {title.lot}
                                                                </Text> : null
                                                        }
                                                        {
                                                            (title.block !== null) ?
                                                                <Text style={stylesBuildMyTitle.formTextContent}>
                                                                    Block: {title.block}
                                                                </Text> : null
                                                        }


                                                    </View>

                                                </View>
                                                :
                                                <View>
                                                    <Text
                                                        style={stylesBuildMyTitle.formTextContent}>Section: {title.section}</Text>
                                                    <Text
                                                        style={stylesBuildMyTitle.formTextContent}>Township: {title.township}</Text>
                                                    <Text style={{
                                                        fontSize: 12,
                                                        marginRight: 8
                                                    }}>Range:{title.range}</Text>
                                                </View>
                                        }
                                        {
                                            (title.condoName != null) ?
                                                <View>
                                                    <Text
                                                        style={stylesBuildMyTitle.formTextContentCapitalize}
                                                        numberOfLines={1}>{title.condoName}</Text>
                                                </View> : null
                                        }
                                    </View>
                                </TouchableOpacity>

                            </Card.Content>
                        </Card>

                    </View>

                    <ScrollView style={{marginBottom: 10}}
                                refreshControl={ <RefreshControl refreshing={this.state.cloudRefreshing} onRefresh={() => {
                                    this.loadToCloud();
                                }}
                                />}
                    >
                        <List.Section>
                            {
                                this.state.documentList.map((item, index) => {
                                    return <Card
                                        style={[styles.card, (item.deedType.scope === 'secondary') ? {marginLeft: 15} : null]}>
                                        <Card.Content>
                                            <TouchableOpacity
                                                onPress={() => {
                                                    this.navigate(item);
                                                }}>
                                                {
                                                    (item.deedType.docType === 'tax' ) ?
                                                        <View>
                                                            <Text style={{
                                                                fontWeight: 'bold',
                                                                marginVertical: 5
                                                            }}>{item.deedType.name}</Text>
                                                            <Text style={{fontSize: 12}}
                                                                  numberOfLines={1}>County: {item.county}</Text>
                                                            <Text
                                                                style={{fontSize: 12}}
                                                                numberOfLines={1}>Municipality: {item.municipality}</Text>
                                                        </View> :
                                                        (item.deedType.docType === 'plat_floor_plan') ?
                                                            <View>
                                                                <Text style={{
                                                                    fontWeight: 'bold',
                                                                    marginVertical: 5
                                                                }}>{item.deedType.name}</Text>
                                                                <View style={{
                                                                    flexDirection: 'row',
                                                                    alignContent: 'space-between'
                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: 12,
                                                                        width: "75%"
                                                                    }}>{(item.deedType.scope == 'secondary') ? 'Revised ' : null}
                                                                        Plat Without a Book and PageInfo:</Text>
                                                                    <Text style={{
                                                                        fontSize: 12,
                                                                        flex: 1,
                                                                    }}>Book: {item.platBook}</Text>
                                                                </View>
                                                                <View style={{
                                                                    flexDirection: 'row',
                                                                    alignContent: 'space-between',

                                                                }}>
                                                                    <Text style={{
                                                                        fontSize: 12,
                                                                        width: "75%",
                                                                    }}
                                                                          numberOfLines={1}>{item.withoutBookPageInfo}</Text>
                                                                    <Text style={{
                                                                        fontSize: 12,
                                                                        flex: 1,
                                                                    }}>Page: {item.platPage}</Text>
                                                                </View>
                                                            </View> :
                                                            (item.deedType.docType === 'misc_civil_probate') ?
                                                                <View>
                                                                    <Text style={{
                                                                        fontWeight: 'bold',
                                                                        marginVertical: 5
                                                                    }}>{item.deedType.name}</Text>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignContent: 'space-between'
                                                                    }}>
                                                                        <Text style={{fontSize: 12, width: "75%"}}
                                                                              numberOfLines={1}>InstrumentType: {item.instrumentType}</Text>
                                                                        <Text style={{
                                                                            fontSize: 12,
                                                                            flex: 1,
                                                                        }}>Book: {item.book}</Text>
                                                                    </View>
                                                                    <View style={{
                                                                        flexDirection: 'row',
                                                                        alignContent: 'space-between',

                                                                    }}>
                                                                        <Text style={{
                                                                            fontSize: 12,
                                                                            width: "75%",
                                                                        }}>FileNumber: {item.fileNumber}</Text>
                                                                        <Text style={{
                                                                            fontSize: 12,
                                                                            flex: 1,
                                                                        }}>Page: {item.page}</Text>
                                                                    </View>
                                                                </View> :
                                                                (item.deedType.docType === 'lien') ?
                                                                    <View>
                                                                        <Text
                                                                            style={{
                                                                                fontWeight: 'bold',
                                                                                marginVertical: 5
                                                                            }}>
                                                                            {item.deedType.name}
                                                                        </Text>
                                                                        <View style={{
                                                                            flexDirection: 'row',
                                                                            alignContent: 'space-between'
                                                                        }}>
                                                                            {
                                                                                (item.lienor) ?
                                                                                    <Text style={{
                                                                                        fontSize: 12,
                                                                                        width: "75%"
                                                                                    }} numberOfLines={1}>Lienor/Plaintiff: {item.lienor}</Text>
                                                                                    :
                                                                                    (item.assignedTransferred) ?
                                                                                        <Text style={{
                                                                                            fontSize: 12,
                                                                                            width: "75%",
                                                                                        }}>To: {item.assignedTransferred}</Text>
                                                                                        : <Text style={{
                                                                                        fontSize: 12,
                                                                                        width: "75%",
                                                                                    }}></Text>
                                                                            }
                                                                            <Text style={{
                                                                                fontSize: 12,
                                                                                flex: 1,
                                                                            }}>Book: {item.book}</Text>
                                                                        </View>
                                                                        <View style={{
                                                                            flexDirection: 'row',
                                                                            alignContent: 'space-between',

                                                                        }}>
                                                                            {
                                                                                (item.debtor) ?
                                                                                    <Text style={{
                                                                                        fontSize: 12,
                                                                                        width: "75%",
                                                                                    }} numberOfLines={1}>Debtor/Defendant: {item.debtor}</Text>
                                                                                    :
                                                                                    <Text style={{
                                                                                        fontSize: 12,
                                                                                        width: "75%",
                                                                                    }}></Text>
                                                                            }
                                                                            <Text style={{
                                                                                fontSize: 12,
                                                                                flex: 1,
                                                                            }}>Page: {item.page}</Text>
                                                                        </View>
                                                                    </View>
                                                                    :
                                                                    <View>
                                                                        <View style={{
                                                                            flexDirection: 'row',
                                                                            alignContent: 'space-between'
                                                                        }}>

                                                                            <Text style={{
                                                                                fontWeight: 'bold',
                                                                                marginVertical: 5, width: "70%"
                                                                            }}>{item.deedType.name}</Text>

                                                                            <Text style={{
                                                                                fontWeight: 'bold',
                                                                                marginVertical: 5,
                                                                                color: Palette.secondary
                                                                            }}>
                                                                                {(item.currentOwner != null && item.currentOwner) ? "Current Owner" : ""}
                                                                            </Text>
                                                                        </View>


                                                                        <View style={{
                                                                            flexDirection: 'row',
                                                                            alignContent: 'space-between'
                                                                        }}>
                                                                            {
                                                                                (item.grantee) ?
                                                                                    <Text style={{
                                                                                        fontSize: 12,
                                                                                        width: "75%",
                                                                                    }}
                                                                                          numberOfLines={1}>Grantor: {item.grantor}</Text>
                                                                                    :
                                                                                    (item.assignedTransfer) ?
                                                                                        <Text style={{
                                                                                            fontSize: 12,
                                                                                            width: "75%",
                                                                                        }}>To: {item.assignedTransfer}</Text>
                                                                                        :
                                                                                        <Text style={{
                                                                                            fontSize: 12,
                                                                                            width: "75%",
                                                                                        }}></Text>
                                                                            }
                                                                            <Text style={{
                                                                                fontSize: 12,
                                                                                flex: 1,
                                                                            }}>Book:{item.deedBook}</Text>
                                                                        </View>
                                                                        <View style={{
                                                                            flexDirection: 'row',
                                                                            alignContent: 'space-between',

                                                                        }}>
                                                                            {(item.grantee) ?
                                                                                <Text style={{
                                                                                    fontSize: 12,
                                                                                    width: "75%",
                                                                                }}
                                                                                      numberOfLines={1}>Grantee: {item.grantee}</Text>
                                                                                : <Text style={{
                                                                                    fontSize: 12,
                                                                                    width: "75%",
                                                                                }}></Text>
                                                                            }
                                                                            <Text style={{
                                                                                fontSize: 12,
                                                                                flex: 1,
                                                                            }}>Page: {item.deedPage}</Text>
                                                                        </View>
                                                                    </View>
                                                }
                                            </TouchableOpacity>
                                        </Card.Content>
                                    </Card>;
                                })
                            }
                        </List.Section>
                    </ScrollView>

                    <View style={[styles.buttonRow, {flexDirection: "row", align: 'center'}]}>
                        <Button
                            style={{flex: 1, marginHorizontal: 5}}
                            mode="contained"
                            uppercase={false}
                            color={Palette.primary}
                            onPress={() => this.props.navigation.navigate('ChooseADocument', {title: {...this.state.title}})}>
                            Add New Document
                        </Button>
                        <Button
                            color={Palette.success}
                            style={{flex: 1, marginHorizontal: 5}}
                            mode="contained"
                            uppercase={false}
                            onPress={() => {
                                this.loadToCloud();
                                this.props.navigation.navigate('CovenantsForm', {title: {...this.state.title}});
                            }}>
                            Complete My Title
                        </Button>
                    </View>

                </View>

            </SafeAreaView>
        );
    }
}

const
    stylesBuildMyTitle = StyleSheet.create({

        formTextTitle: {
            fontWeight: 'bold',
            marginLeft: 5,
            marginVertical: 5

        },
        formTextContent: {
            fontSize: 12,
        },
        formTextContentCapitalize: {
            textTransform: 'capitalize',
            fontSize: 12
        },
        card: {
            alignContent: 'center',
            backgroundColor: Palette.aqua,
            width: "49%",
            height: "95%",
            elevation: 3,
        },
        cardItem: {
            shadowColor: '#00000021',
            shadowOffset: {
                width: 0,
                height: 5,
            },
            shadowOpacity: 0.37,
            shadowRadius: 5.49,
            elevation: 6,
            marginVertical: 5,
            backgroundColor: Palette.light,
            padding: 10,
        },
    });


