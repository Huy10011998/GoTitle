import {
    EntityRepository, RemoveOptions, Repository, getCustomRepository, getRepository, DeepPartial,
    SaveOptions
} from "typeorm";
import {
    Title,
    TitleDetail,
    Location
} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";
import {DeedRepository} from "./DeedRepository";
import {CovenantRepository} from "./CovenantRepository";
import {MiscCivilProbateRepository} from "./MiscCivilProbateRepository";
import {LienRepository} from "./LienRepository";
import {MortgageRepository} from "./MortgageRepository";
import {TaxRepository} from "./TaxRepository";
import {PlatFloorPlanRepository} from "./PlatFloorPlanRepository";
import {EasementRepository} from "./EasementRepository";
import {LocationRepository} from "./LocationRepository";
import {TitleDetailRepository} from "./TitleDetailRepository";
import {TitleBookPageRepository} from "./TitleBookPageRepository";
import {TitleBuyerRepository} from "./TitleBuyerRepository";
import {TitleSellerRepository} from "./TitleSellerRepository";
import {CustomerRepository} from "./CustomerRepository";
import {UserRepository} from "./UserRepository";

@EntityRepository(Title)
export class TitleRepository extends ApiEntityRepository<Title> {
    titleSellerRepository: TitleSellerRepository;
    titleBuyerRepository: TitleBuyerRepository;
    titleBookPageRepository: TitleBookPageRepository;
    locationRepository: LocationRepository;
    titleDetailRepository: TitleDetailRepository;
    miscRepository: MiscCivilProbateRepository;
    taxRepository: TaxRepository;
    platFloorRepository: PlatFloorPlanRepository;
    mortgageRepository: MortgageRepository;
    lienRepository: LienRepository;
    easementRepository: EasementRepository;
    covenantRepository: CovenantRepository;
    deedRepository: DeedRepository;
    customerRepository: CustomerRepository;
    userRepository: UserRepository;

    constructor() {
        super();
        this.deedRepository = getCustomRepository(DeedRepository);
        this.covenantRepository = getCustomRepository(CovenantRepository);
        this.easementRepository = getCustomRepository(EasementRepository);
        this.lienRepository = getCustomRepository(LienRepository);
        this.miscRepository = getCustomRepository(MiscCivilProbateRepository);
        this.mortgageRepository = getCustomRepository(MortgageRepository);
        this.platFloorRepository = getCustomRepository(PlatFloorPlanRepository);
        this.taxRepository = getCustomRepository(TaxRepository);
        this.titleDetailRepository = getCustomRepository(TitleDetailRepository);
        this.locationRepository = getCustomRepository(LocationRepository);
        this.titleBookPageRepository = getCustomRepository(TitleBookPageRepository);
        this.titleBuyerRepository = getCustomRepository(TitleBuyerRepository);
        this.titleSellerRepository = getCustomRepository(TitleSellerRepository);
        this.customerRepository = getCustomRepository(CustomerRepository);
        this.userRepository = getCustomRepository(UserRepository);

        this.apiRoute = 'titles';
    }

    getRequestConfig(localEntity, relations = []): any | { getAll: { url: string; method: string; params: { offset: number; limit: number } }; post: { url: string; method: string } } {
        let requestConfig = super.getRequestConfig(localEntity, relations);
        requestConfig.getAll.params['source'] = "gotitle";
        return requestConfig;
    }

    async remove(title: Title, options?: RemoveOptions): Promise<Title> {
        // Remove dependencies first
        // let deedList = await this.deedRepository.getAllByTitle(title);
        // await this.deedRepository.remove(deedList);
        // let covenantList = await this.covenantRepository.getAllByTitle(title);
        // await this.covenantRepository.remove(covenantList);
        // let easementList = await this.easementRepository.getAllByTitle(title);
        // await this.easementRepository.remove(easementList);
        // let lienList = await this.lienRepository.getAllByTitle(title);
        // await this.lienRepository.remove(lienList);
        // let miscList = await this.miscRepository.getAllByTitle(title);
        // await this.miscRepository.remove(miscList);
        // let mortgageList = await this.mortgageRepository.getAllByTitle(title);
        // await this.mortgageRepository.remove(mortgageList);
        // let platFloorList = await this.platFloorRepository.getAllByTitle(title);
        // await this.platFloorRepository.remove(platFloorList);
        // let taxList = await this.taxRepository.getAllByTitle(title);
        // await this.taxRepository.remove(taxList);
        //
        // let titleBookPageList = await this.titleBookPageRepository.getAllByTitle(title);
        // await this.titleBookPageRepository.remove(titleBookPageList);
        // let titleSellerList = await this.titleSellerRepository.getAllByTitle(title);
        // await this.titleSellerRepository.remove(titleSellerList);
        // let titleBuyerList = await this.titleBuyerRepository.getAllByTitle(title);
        // await this.titleBuyerRepository.remove(titleBuyerList);
        //
        // let titleDetail = title.titleDetail;
        // if (!titleDetail) {
        //     titleDetail = await this.titleDetailRepository.getByTitle(title);
        // }
        // if (titleDetail) {
        //     await this.titleDetailRepository.remove(titleDetail);
        // }
        //
        // let location = title.location;
        // if (!location) {
        //     location = await this.locationRepository.getByTitle(title);
        // }
        //
        // await super.remove(title, options);
        // if (location) {
        //     await this.locationRepository.remove(location);
        // }
    }

    /**
     * @deprecated
     * @param deed
     * @returns {Promise<Title[]>}
     */
    getAllByCurrentOwner(deed): Promise<Title[]> {
        return this.createQueryBuilder('t')
            .where('t.currentOwnerDeedId = :deedId', {deedId: deed.id}).getMany();
    }

    exportApiData(localItem) {
        console.log('exportApiData');
        let apiData = super.exportApiData(localItem);
        apiData['zones'] = localItem.zones;

        //add Extra custom api Data
        if (localItem.location !== undefined) {
            apiData['location'] = this.locationRepository.exportApiData(localItem.location);
        }

        if (localItem.titleDetail !== undefined) {
            apiData['titleDetail'] = this.titleDetailRepository.exportApiData(localItem.titleDetail);
        }

        return apiData;
    }

    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        // TypeORM returns undefined when the relation has not been loaded. And NULL when the relation has been loaded with no result.
        console.log('importApiData');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.zones = apiData.zones;
        }
        console.log('title res: '+ res);
        let tmpRes;
        // sync location / embedded
        if (localItem.location !== undefined || !localItem.id) {
            if (apiData.location || localItem.location) {
                if (!apiData.location) {
                    if (res === 0) res = 1;
                } else {
                    if (!localItem.location) {
                        let newLocation = await this.locationRepository.findByApiId(apiData.location.id);
                        if (newLocation) {
                            localItem.location = newLocation;
                        } else {
                            localItem.location = this.locationRepository.create();
                            await this.locationRepository.importApiData(localItem.location, apiData.location, [], forceImport);
                        }
                        if (res === 0) res = -1;
                    } else {
                        if (localItem.location.apiId == apiData.location.id) {
                            let tmpRes = await this.locationRepository.importApiData(localItem.location, apiData.location, [], forceImport);
                            if (res === 0) res = tmpRes;
                        } else {
                            let newLocation = await this.locationRepository.findByApiId(apiData.location.id);
                            if (newLocation) {
                                localItem.location = newLocation;
                            } else {
                                localItem.location = this.locationRepository.create();
                                await this.locationRepository.importApiData(localItem.location, apiData.location, [], forceImport);
                            }
                            if (res === 0) res = -1;
                        }
                    }
                }
            }
            console.log('title location res: '+ res);
        }

        // sync titleDetail / embedded
        if (localItem.titleDetail !== undefined || !localItem.id) {
            if (apiData.titleDetail !== null || localItem.titleDetail !== null) {
                if (!apiData.titleDetail) {
                    if (res === 0) res = 1;
                } else {
                    if(!localItem.titleDetail) {
                        let newTitleDetail = await this.titleDetailRepository.findByApiId(apiData.titleDetail.id);
                        if (newTitleDetail) {
                            localItem.titleDetail = newTitleDetail;
                            localItem.titleDetail.title = localItem;
                        } else {
                            localItem.titleDetail = this.titleDetailRepository.create();
                            localItem.titleDetail.title = localItem;
                            await this.titleDetailRepository.importApiData(localItem.titleDetail, apiData.titleDetail, [], forceImport);
                        }
                        if (res === 0) res = -1;
                    } else {
                        if (localItem.titleDetail.apiId == apiData.titleDetail.id) {
                            let tmpRes = await this.titleDetailRepository.importApiData(localItem.titleDetail, apiData.titleDetail, [], forceImport);
                            if (res === 0) res = tmpRes;
                        } else {
                            let newTitleDetail = await this.titleDetailRepository.findByApiId(apiData.titleDetail.id);
                            if (newTitleDetail) {
                                localItem.titleDetail = newTitleDetail;
                                localItem.titleDetail.title = localItem;
                            } else {
                                localItem.titleDetail = this.titleDetailRepository.create();
                                localItem.titleDetail.title = localItem;
                                await this.titleDetailRepository.importApiData(localItem.titleDetail, apiData.titleDetail, [], forceImport);
                            }
                            if (res === 0) res = -1;
                        }
                    }
                }
            }
            console.log('title detail res: '+ res);
        }

        // sync customer / not embedded
        let newCustomer;
        if (localItem.customer !== undefined || !localItem.id) {
            if (apiData.customer || localItem.customer) {
                if (!apiData.customer) {
                    if (res === 0) res = 1;
                } else {
                    if (!localItem.customer || localItem.customer.apiId != apiData.customer.id) {
                        newCustomer = await this.customerRepository.findByApiId(apiData.customer.id);
                        if (newCustomer) {
                            localItem.customer = newCustomer;
                        } else {
                            newCustomer = this.customerRepository.create();
                            await this.customerRepository.importApiData(newCustomer, apiData.customer, [], forceImport);
                            await this.customerRepository.save(newCustomer);
                            localItem.customer = newCustomer;
                        }
                        if (res === 0) res = -1;
                    }
                }
            }
            console.log('title customer res: '+ res);
        }

        let newUser;
        if(localItem.owner !== undefined || !localItem.id){
            if (apiData.owner || localItem.owner) {
                if (!apiData.owner) {
                    if (res === 0) res = 1;
                } else {
                    if (!localItem.owner || localItem.owner.apiId != apiData.owner.id) {
                        newUser = await this.userRepository.findByApiId(apiData.owner.id);
                        if (newUser) {
                            localItem.owner = newUser;
                        } else {
                            newUser = this.userRepository.create();
                            await this.userRepository.importApiData(newUser, apiData.owner, [], forceImport);
                            await this.userRepository.save(newUser);
                            localItem.owner = newUser;
                        }
                        if (res === 0) res = -1;
                    }
                }
            }
            console.log('title owner res: '+ res);
        }
        return res;
    }

    async save<T extends DeepPartial<Title>>(entity: T, options?: SaveOptions): Promise<T> {
        let res = await super.save(entity, options);
        // save the embedded relations
        if (entity.titleDetail) {
            await this.titleDetailRepository.save(entity.titleDetail);
        }
        return res;
    }
}