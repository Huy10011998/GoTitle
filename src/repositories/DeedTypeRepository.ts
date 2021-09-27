import {ENDPOINT} from 'react-native-dotenv';
import {EntityRepository, getCustomRepository, RemoveOptions, Repository} from "typeorm";
import {DeedType} from "src/entities/index";
import {ApiEntityRepository} from "./ApiEntityRepository";

// import {DeedRepository} from "./DeedRepository";
// import {CovenantRepository} from "./CovenantRepository";
// import {MiscCivilProbateRepository} from "./MiscCivilProbateRepository";
// import {LienRepository} from "./LienRepository";
// import {MortgageRepository} from "./MortgageRepository";
// import {TaxRepository} from "./TaxRepository";
// import {PlatFloorPlanRepository} from "./PlatFloorPlanRepository";
// import {EasementRepository} from "./EasementRepository";

@EntityRepository(DeedType)
export class DeedTypeRepository extends ApiEntityRepository<DeedType> {

    // miscRepository: MiscCivilProbateRepository;
    // taxRepository: TaxRepository;
    // platFloorRepository: PlatFloorPlanRepository;
    // mortgageRepository: MortgageRepository;
    // lienRepository: LienRepository;
    // easementRepository: EasementRepository;
    // covenantRepository: CovenantRepository;
    // deedRepository: DeedRepository;

    constructor() {
        super();
        // this.deedRepository = getCustomRepository(DeedRepository);
        // this.covenantRepository = getCustomRepository(CovenantRepository);
        // this.easementRepository = getCustomRepository(EasementRepository);
        // this.lienRepository = getCustomRepository(LienRepository);
        // this.miscRepository = getCustomRepository(MiscCivilProbateRepository);
        // this.mortgageRepository = getCustomRepository(MortgageRepository);
        // this.platFloorRepository = getCustomRepository(PlatFloorPlanRepository);
        // this.taxRepository = getCustomRepository(TaxRepository);

        this.apiRoute = 'deed-types';
    }

    async remove(deedType: DeedType, options?: RemoveOptions): Promise<DeedType> {
        // Remove dependencies first
        // let deedList = await this.deedRepository.getAllByDeedType(deedType);
        // await this.deedRepository.remove(deedList);
        // let covenantList = await this.covenantRepository.getAllByDeedType(deedType);
        // await this.covenantRepository.remove(covenantList);
        // let easementList = await this.easementRepository.getAllByDeedType(deedType);
        // await this.easementRepository.remove(easementList);
        // let lienList = await this.lienRepository.getAllByDeedType(deedType);
        // await this.lienRepository.remove(lienList);
        // let miscList = await this.miscRepository.getAllByDeedType(deedType);
        // await this.miscRepository.remove(miscList);
        // let mortgageList = await this.mortgageRepository.getAllByDeedType(deedType);
        // await this.mortgageRepository.remove(mortgageList);
        // let platFloorList = await this.platFloorRepository.getAllByDeedType(deedType);
        // await this.platFloorRepository.remove(platFloorList);
        // let taxList = await this.taxRepository.getAllByDeedType(deedType);
        // await this.taxRepository.remove(taxList);
    }

    async importApiData(localItem, apiData, relations = [], forceImport = false) {
        // TypeORM returns undefined when the relation has not been loaded. And NULL when the relation has been loaded with no result.
        console.log('importApiData DeedType');
        let res = await super.importApiData(localItem, apiData, relations, forceImport);
        if (res === -1) {
            localItem.title = relations[0];
        }
        console.log('DeedType res: ' + res);

        return res;
    }

}