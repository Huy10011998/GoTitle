import {getCustomRepository} from "typeorm";
import {TitleRepository,
    DeedRepository,
    CovenantRepository,
    EasementRepository,
    LienRepository,
    MiscCivilProbateRepository,
    MortgageRepository,
    PlatFloorPlanRepository,
    TaxRepository,
    DeedTypeRepository,
    LocationRepository,
    TitleDetailRepository,
    TitleBookPageRepository,
    TitleSellerRepository,
    TitleBuyerRepository
} from 'src/repositories/index';

export class TitleTest {


    constructor() {
        this.titleRepository = getCustomRepository(TitleRepository);
        this.locationRepository = getCustomRepository(LocationRepository);
        this.titleDetailRepository = getCustomRepository(TitleDetailRepository);
        this.deedTypeRepository = getCustomRepository(DeedTypeRepository);
        this.covenantRepository = getCustomRepository(CovenantRepository);
        this.deedRepository = getCustomRepository(DeedRepository);
        this.mortgageRepository = getCustomRepository(MortgageRepository);
        this.easementRepository = getCustomRepository(EasementRepository);
        this.lienRepository = getCustomRepository(LienRepository);
        this.miscRepository = getCustomRepository(MiscCivilProbateRepository);
        this.platRepository = getCustomRepository(PlatFloorPlanRepository);
        this.taxRepository = getCustomRepository(TaxRepository);
        this.titleBookPageRepository = getCustomRepository(TitleBookPageRepository);
        this.titleSellerRepository = getCustomRepository(TitleSellerRepository);
        this.titleBuyerRepository = getCustomRepository(TitleBuyerRepository);
    }

    async createTest() {
        console.log('Create Title Test');

        let location = this.locationRepository.create();
        location.name = 'test_location';
        await this.locationRepository.save(location);

        let testTitle = this.titleRepository.create();
        testTitle.condoName = 'test_title';
        testTitle.location = location;
        await this.titleRepository.save(testTitle);

        let titleDetail = this.titleDetailRepository.create();
        titleDetail.companyName = 'test_company';
        titleDetail.title = testTitle;
        await this.titleDetailRepository.save(titleDetail);

        testTitle = await this.titleRepository.findOne({where: {id: testTitle.id}, relations: ['location', 'titleDetail']});
        if (testTitle && testTitle.id) {
            console.log('title Saved', testTitle);
        } else {
            console.warn('title Not Saved');
            return;
        }

        await this.createDeeds(testTitle);

        await this.createMortgages(testTitle);

        await this.createCovenants(testTitle);

        await this.createEasements(testTitle);

        await this.createLiens(testTitle);
        
        await this.createMiscs(testTitle);

        await this.createPlats(testTitle);

        await this.createTaxes(testTitle);

        await this.createTitleBookPages(testTitle);

        await this.createTitleSellers(testTitle);

        await this.createTitleBuyers(testTitle);
    }

    async removeTest() {
        console.log('Remove title Test');
        // let lienList = await this.lienRepository.find();
        // console.log(lienList.length);
        // return;

        let titleList = await this.titleRepository.find({where: {condoName: 'test_title'}, relations: ['location', 'titleDetail']});
        let prevLength = titleList.length;
        console.log(prevLength);
        titleList.forEach(title => console.log(title));

        if (titleList.length > 0) {
            let testTitle = titleList[0];
            await this.titleRepository.remove(testTitle);
            titleList = await this.titleRepository.find({where: {condoName: 'test_title'}, relations: ['location', 'titleDetail']});
            if (titleList.length == (prevLength -1)) {
                console.log('The Title was successfully removed');
            } else {
                console.warn('The Title was not removed');
            }
        }
    }

    async createMortgages(testTitle) {
        // add mortgages
        let mortgageDeedTypeMaster = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'mortgage'}});
        let mortgageDeedTypeSecondary = await this.deedTypeRepository.findOne({where: {scope: 'secondary', docType: 'mortgage'}});
        let testMortgage;
        let totalItems = 3;
        let countChildren = 3;
        let childMortgage;
        let childMortgageList;
        for(let i=0;i<totalItems; i++) {
            testMortgage = this.mortgageRepository.create();
            testMortgage.deedBook = 'test_book_'+i;
            testMortgage.title = testTitle;
            testMortgage.deedType = mortgageDeedTypeMaster;
            await this.mortgageRepository.save(testMortgage);

            for (let j=0; j<countChildren; j++) {
                childMortgage = this.mortgageRepository.create();
                childMortgage.masterDocument = testMortgage;
                childMortgage.deedBook = 'test_book_'+i;
                childMortgage.title = testTitle;
                childMortgage.deedType = mortgageDeedTypeSecondary;
                await this.mortgageRepository.save(childMortgage);
            }
            //check all children were saved;
            childMortgageList = await this.mortgageRepository.getAllByMaster(testMortgage);
            if (childMortgageList.length !== countChildren) {
                console.warn('Child Mortgage List not equal to '+countChildren, childMortgageList.length);
            } else {
                console.log('Child Mortgage list test passed');
            }
        }
        let mortgageList = await this.mortgageRepository.getAllMasterByTitle(testTitle);
        if (mortgageList.length !== totalItems) {
            console.warn('Mortgage List not equal to '+totalItems, mortgageList.length);
        } else {
            console.log('Mortgage list test passed');
        }

        //test remove document
        await this.mortgageRepository.remove(mortgageList[0]);
        totalItems -= 1;
        mortgageList = await this.mortgageRepository.getAllMasterByTitle(testTitle);
        if (mortgageList.length == totalItems) {
            console.log('Mortgage Deletion test passed');
        } else {
            console.warn('Mortgage List not equal to '+totalItems, mortgageList.length);
        }
    }

    async createDeeds(testTitle) {
        // add deeds
        let deedTypeMaster = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'deed'}});
        let testDeed;
        let totalItems = 3;

        for(let i=0;i<totalItems; i++) {
            testDeed = this.deedRepository.create();
            testDeed.deedBook = 'test_book_'+i;
            testDeed.title = testTitle;
            testDeed.deedType = deedTypeMaster;
            await this.deedRepository.save(testDeed);
        }
        let deedList = await this.deedRepository.getAllByTitle(testTitle);
        if (deedList.length !== totalItems) {
            console.warn('Deed List not equalt to '+totalItems, deedList.length);
        } else {
            console.log('Deed list test passed');
        }

        //test remove document
        await this.deedRepository.remove(deedList[0]);
        totalItems -= 1;
        deedList = await this.deedRepository.getAllByTitle(testTitle);
        if (deedList.length == totalItems) {
            console.log('Deed Deletion test passed');
        } else {
            console.warn('Deed List not equal to '+totalItems, deedList.length);
        }
    }

    async createCovenants(testTitle) {
        // add covenant
        let covenantDeedTypeMaster = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'covenant'}});
        let covenantDeedTypeSecondary = await this.deedTypeRepository.findOne({where: {scope: 'secondary', docType: 'covenant'}});
        let testCovenant;
        let totalItems = 3;
        let countChildren = 3;
        let childCovenant;
        let childCovenantList;
        for(let i=0;i<totalItems; i++) {
            testCovenant = this.covenantRepository.create();
            testCovenant.deedBook = 'test_book_'+i;
            testCovenant.title = testTitle;
            testCovenant.deedType = covenantDeedTypeMaster;
            await this.covenantRepository.save(testCovenant);

            for (let j=0; j<countChildren; j++) {
                childCovenant = this.covenantRepository.create();
                childCovenant.masterDocument = testCovenant;
                childCovenant.deedBook = 'test_book_'+i;
                childCovenant.title = testTitle;
                childCovenant.deedType = covenantDeedTypeSecondary;
                await this.covenantRepository.save(childCovenant);
            }
            //check all children were saved;
            childCovenantList = await this.covenantRepository.getAllByMaster(testCovenant);
            if (childCovenantList.length !== countChildren) {
                console.warn('Child Covenant List not equal to '+countChildren, childCovenantList.length);
            } else {
                console.log('Child Covenant list test passed');
            }
        }
        let covenantList = await this.covenantRepository.getAllMasterByTitle(testTitle);
        if (covenantList.length !== totalItems) {
            console.warn('Covenant List not equal to '+totalItems, covenantList.length);
        } else {
            console.log('Covenant creation test passed');
        }

        //test remove one master
        await this.covenantRepository.remove(covenantList[0]);
        totalItems -= 1;
        covenantList = await this.covenantRepository.getAllMasterByTitle(testTitle);
        if (covenantList.length == totalItems) {
            console.log('Covenant Deletion test passed');
        } else {
            console.warn('Covenant List not equal to '+totalItems, covenantList.length);
        }
    }

    async createEasements(testTitle) {
        // add easement
        let easementDeedType = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'easement'}});
        let testEasement;
        let totalItems = 3;
        for(let i=0;i<totalItems; i++) {
            testEasement = this.easementRepository.create();
            testEasement.deedBook = 'test_book_'+i;
            testEasement.title = testTitle;
            testEasement.deedType = easementDeedType;
            await this.easementRepository.save(testEasement);
        }
        let easementList = await this.easementRepository.getAllByTitle(testTitle);
        if (easementList.length !== totalItems) {
            console.warn('Easement List not equal to '+totalItems, easementList.length);
        } else {
            console.log('Easement list test passed');
        }

        //test remove one master
        await this.easementRepository.remove(easementList[0]);
        totalItems -= 1;
        easementList = await this.easementRepository.getAllByTitle(testTitle);
        if (easementList.length == totalItems) {
            console.log('Easement Deletion test passed');
        } else {
            console.warn('Easement List not equal to '+totalItems, easementList.length);
        }
    }

    async createLiens(testTitle) {
        // add liens
        let lienDeedTypeMaster = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'lien'}});
        let lienDeedTypeSecondary = await this.deedTypeRepository.findOne({where: {scope: 'secondary', docType: 'lien'}});
        let testLien;
        let totalItems = 3;
        let countChildren = 3;
        let childLien;
        let childLienList;
        for(let i=0;i<totalItems; i++) {
            testLien = this.lienRepository.create();
            testLien.book = 'test_book_'+i;
            testLien.title = testTitle;
            testLien.deedType = lienDeedTypeMaster;
            await this.lienRepository.save(testLien);

            for (let j=0; j<countChildren; j++) {
                childLien = this.lienRepository.create();
                childLien.masterDocument = testLien;
                childLien.book = 'test_book_'+i;
                childLien.title = testTitle;
                childLien.deedType = lienDeedTypeSecondary;
                await this.lienRepository.save(childLien);
            }
            //check all children were saved;
            childLienList = await this.lienRepository.getAllByMaster(testLien);
            if (childLienList.length !== countChildren) {
                console.warn('Child Lien List not equal to '+countChildren, childLienList.length);
            } else {
                console.log('Child Lien list test passed');
            }
        }
        let lienList = await this.lienRepository.getAllMasterByTitle(testTitle);
        if (lienList.length !== totalItems) {
            console.warn('Lien List not equal to '+totalItems, lienList.length);
        } else {
            console.log('Lien list test passed');
        }

        //test remove one master
        await this.lienRepository.remove(lienList[0]);
        totalItems -= 1;
        lienList = await this.lienRepository.getAllMasterByTitle(testTitle);
        if (lienList.length == totalItems) {
            console.log('Lien Deletion test passed');
        } else {
            console.warn('Lien List not equal to '+totalItems, lienList.length);
        }
    }

    async createMiscs(testTitle) {
        // add misc
        let miscDeedType = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'misc_civil_probate'}});
        let testMisc;
        let totalItems = 3;
        for(let i=0;i<totalItems; i++) {
            testMisc = this.miscRepository.create();
            testMisc.book = 'test_book_'+i;
            testMisc.title = testTitle;
            testMisc.deedType = miscDeedType;
            await this.miscRepository.save(testMisc);
        }
        let miscList = await this.miscRepository.getAllByTitle(testTitle);
        if (miscList.length !== totalItems) {
            console.warn('Misc List not equal to '+totalItems, miscList.length);
        } else {
            console.log('Misc list test passed');
        }

        //test remove one document
        await this.miscRepository.remove(miscList[0]);
        totalItems -= 1;
        miscList = await this.miscRepository.getAllByTitle(testTitle);
        if (miscList.length == totalItems) {
            console.log('Misc Deletion test passed');
        } else {
            console.warn('Misc List not equal to '+totalItems, miscList.length);
        }
    }

    async createPlats(testTitle) {
        // add plans
        let platDeedTypeMaster = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'plat_floor_plan'}});
        let platDeedTypeSecondary = await this.deedTypeRepository.findOne({where: {scope: 'secondary', docType: 'plat_floor_plan'}});
        let testPlat;
        let totalItems = 3;
        let countChildren = 3;
        let childPlat;
        let childPlatList;
        for(let i=0;i<totalItems; i++) {
            testPlat = this.platRepository.create();
            testPlat.platBook = 'test_book_'+i;
            testPlat.title = testTitle;
            testPlat.deedType = platDeedTypeMaster;
            await this.platRepository.save(testPlat);

            for (let j=0; j<countChildren; j++) {
                childPlat = this.platRepository.create();
                childPlat.masterDocument = testPlat;
                childPlat.platBook = 'test_book_'+i;
                childPlat.title = testTitle;
                childPlat.deedType = platDeedTypeSecondary;
                await this.platRepository.save(childPlat);
            }
            //check all children were saved;
            childPlatList = await this.platRepository.getAllByMaster(testPlat);
            if (childPlatList.length !== countChildren) {
                console.warn('Child Plat List not equal to '+countChildren, childPlatList.length);
            } else {
                console.log('Child Plat list test passed');
            }
        }
        let platList = await this.platRepository.getAllMasterByTitle(testTitle);
        if (platList.length !== totalItems) {
            console.warn('PlatFloor List not equal to '+totalItems, platList.length);
        } else {
            console.log('PlatFloor list test passed');
        }

        //test remove one document
        await this.platRepository.remove(platList[0]);
        totalItems -= 1;
        platList = await this.platRepository.getAllMasterByTitle(testTitle);
        if (platList.length == totalItems) {
            console.log('Plat Deletion test passed');
        } else {
            console.warn('Plat List not equal to '+totalItems, platList.length);
        }
    }

    async createTaxes(testTitle) {
        // add tax
        let taxDeedType = await this.deedTypeRepository.findOne({where: {scope: 'master', docType: 'tax'}});
        let testTax;
        let totalItems = 3;
        for(let i=0;i<totalItems; i++) {
            testTax = this.taxRepository.create();
            testTax.county = 'test_county_'+i;
            testTax.title = testTitle;
            testTax.deedType = taxDeedType;
            await this.taxRepository.save(testTax);
        }
        let taxList = await this.taxRepository.getAllByTitle(testTitle);
        if (taxList.length !== totalItems) {
            console.warn('Tax List not equal to '+totalItems, taxList.length);
        } else {
            console.log('Tax list test passed');
        }

        //test remove one document
        await this.taxRepository.remove(taxList[0]);
        totalItems -= 1;
        taxList = await this.taxRepository.getAllByTitle(testTitle);
        if (taxList.length == totalItems) {
            console.log('Tax Deletion test passed');
        } else {
            console.warn('Tax List not equal to '+totalItems, taxList.length);
        }
    }

    async createTitleBookPages(testTitle) {
        // add titleBookPage
        let testTitleBookPage;
        let totalItems = 3;
        for(let i=0;i<totalItems; i++) {
            testTitleBookPage = this.titleBookPageRepository.create();
            testTitleBookPage.book = 'test_book_'+i;
            testTitleBookPage.title = testTitle;
            await this.titleBookPageRepository.save(testTitleBookPage);
        }
        let titleBookPageList = await this.titleBookPageRepository.getAllByTitle(testTitle);
        if (titleBookPageList.length !== totalItems) {
            console.warn('TitleBookPage List not equal to '+totalItems, titleBookPageList.length);
        } else {
            console.log('TitleBookPage list test passed');
        }

        //test remove one document
        await this.titleBookPageRepository.remove(titleBookPageList[0]);
        totalItems -= 1;
        titleBookPageList = await this.titleBookPageRepository.getAllByTitle(testTitle);
        if (titleBookPageList.length == totalItems) {
            console.log('TitleBookPage Deletion test passed');
        } else {
            console.warn('TitleBookPage List not equal to '+totalItems, titleBookPageList.length);
        }
    }

    async createTitleBuyers(testTitle) {
        // add TitleBuyer
        let testTitleBuyer;
        let totalItems = 3;
        for(let i=0;i<totalItems; i++) {
            testTitleBuyer = this.titleBuyerRepository.create();
            testTitleBuyer.name = 'test_name_'+i;
            testTitleBuyer.title = testTitle;
            await this.titleBuyerRepository.save(testTitleBuyer);
        }
        let titleBuyerList = await this.titleBuyerRepository.getAllByTitle(testTitle);
        if (titleBuyerList.length !== totalItems) {
            console.warn('TitleBuyer List not equal to '+totalItems, titleBuyerList.length);
        } else {
            console.log('TitleBuyer list test passed');
        }

        //test remove one document
        await this.titleBuyerRepository.remove(titleBuyerList[0]);
        totalItems -= 1;
        titleBuyerList = await this.titleBuyerRepository.getAllByTitle(testTitle);
        if (titleBuyerList.length == totalItems) {
            console.log('TitleBuyer Deletion test passed');
        } else {
            console.warn('TitleBuyer List not equal to '+totalItems, titleBuyerList.length);
        }
    }

    async createTitleSellers(testTitle) {
        // add TitleSeller
        let testTitleSeller;
        let totalItems = 3;
        for(let i=0;i<totalItems; i++) {
            testTitleSeller = this.titleSellerRepository.create();
            testTitleSeller.name = 'test_name_'+i;
            testTitleSeller.title = testTitle;
            await this.titleSellerRepository.save(testTitleSeller);
        }
        let titleSellerList = await this.titleSellerRepository.getAllByTitle(testTitle);
        if (titleSellerList.length !== totalItems) {
            console.warn('TitleSeller List not equal to '+totalItems, titleSellerList.length);
        } else {
            console.log('TitleSeller list test passed');
        }

        //test remove one document
        await this.titleSellerRepository.remove(titleSellerList[0]);
        totalItems -= 1;
        titleSellerList = await this.titleSellerRepository.getAllByTitle(testTitle);
        if (titleSellerList.length == totalItems) {
            console.log('TitleSeller Deletion test passed');
        } else {
            console.warn('TitleSeller List not equal to '+totalItems, titleSellerList.length);
        }
    }
}