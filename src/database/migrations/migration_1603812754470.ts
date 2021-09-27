import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1603812754470 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {

        queryRunner.query(` CREATE TABLE IF NOT EXISTS tmp_titles (
                            id                    INTEGER PRIMARY KEY NOT NULL,
                            price                 INTEGER DEFAULT 0,
                            searchType            VARCHAR,
                            searchTypeDetail      VARCHAR,
                            searchTypeDetailValue VARCHAR,
                            dateSearch            DATETIME,
                            dateEffective         DATETIME,
                            condoName             VARCHAR,
                            district              VARCHAR,
                            landLot               VARCHAR,
                            section               INTEGER,
                            township              VARCHAR,
                            range                 INTEGER,
                            lot                   VARCHAR,
                            block                 VARCHAR,
                            pod                   VARCHAR,
                            subdivisionSection    VARCHAR,
                            parking               VARCHAR,
                            garage                VARCHAR,
                            interestCommon        VARCHAR,
                            phase                 VARCHAR,
                            unit                  VARCHAR,
                            storage               VARCHAR,
                            wine                  VARCHAR,
                            
                            revised               VARCHAR,
                            longLegal             TEXT,
                            type                  VARCHAR,
                            gmd                   VARCHAR,
                            zones                 TEXT,
                            rtv                   VARCHAR,
                            dbPg                  VARCHAR,
                            jtwros                VARCHAR,
                            note                  TEXT,
                            
                            salesCount            INTEGER,
                            status                VARCHAR             NOT NULL,
                            lastTitleStep         VARCHAR,
                            apartment             VARCHAR,
                            chainTitleType        VARCHAR,
                            certifiedByUser       INTEGER  DEFAULT 0 NOT NULL,
                            
                            apiId                 INTEGER,
                            source                VARCHAR(100) DEFAULT 'gotitle',
                            syncedAt              DATETIME,
                            legalAddress          VARCHAR,
                            mainInvoice           INTEGER,
                            initialCustomer       INTEGER,
                            currentOwnerDeedList  TEXT,
                            tokenReportPdf        VARCHAR,
                            currentOwnerDeedId    INTEGER,
                            
                            createdAt             DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updatedAt             DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            
                            ownerId               INTEGER,
                            locationId            INTEGER UNIQUE,
                            FOREIGN KEY (ownerId) REFERENCES users (id),
                            FOREIGN KEY (locationId) REFERENCES locations (id),
                            FOREIGN KEY (initialCustomer) REFERENCES customer (id),
                            FOREIGN KEY (currentOwnerDeedId) REFERENCES deed (id)
                            );`);
        queryRunner.query(`INSERT INTO tmp_titles SELECT
                            t.id,
                            t.price,
                            t.searchType,
                            t.searchTypeDetail, 
                            t.searchTypeDetailValue, 
                            t.dateSearch, 
                            t.dateEffective,
                            t.condoName,
                            t.district,
                            t.landLot,
                            t.section,
                            t.township,
                            t.range,
                            t.lot,
                            t.block,
                            t.pod,
                            t.subdivisionSection,
                            t.parking,
                            t.garage,
                            t.interestCommon,
                            t.phase,
                            t.unit,
                            t.storage,
                            t.wine,
                                                        
                            t.revised,
                            t.longLegal,                         
                            t.type,
                            t.gmd,
                            t.zones,                          
                            t.rtv,
                            t.dbPg,
                            t.jtwros,
                            t.note, 
                                                     
                            t.salesCount,
                            t.status,
                            t.lastTitleStep,
                            t.apartment,
                            t.chainTitleType,
                            t.certifiedByUser,
                            
                            t.apiId,
                            t.source,
                            t.syncedAt,
                            t.legalAddress,
                            t.mainInvoice,
                            t.initialCustomer,
                            t.currentOwnerDeedList,
                            t.tokenReportPdf,
                            t.currentOwnerDeedId,
                                                        
                            t.createdAt,
                            t.updatedAt,
                            
                            t.ownerId,
                            t.locationId
                             FROM titles AS t;`);

        queryRunner.query(`DROP TABLE IF EXISTS titles;`);

        queryRunner.query(` CREATE TABLE IF NOT EXISTS titles (
                            id                    INTEGER PRIMARY KEY NOT NULL,
                            price                 INTEGER DEFAULT 0,
                            searchType            VARCHAR,
                            searchTypeDetail      VARCHAR,
                            searchTypeDetailValue VARCHAR,
                            dateSearch            DATETIME,
                            dateEffective         DATETIME,
                            condoName             VARCHAR,
                            district              VARCHAR,
                            landLot               VARCHAR,
                            section               INTEGER,
                            township              VARCHAR,
                            range                 INTEGER,
                            lot                   VARCHAR,
                            block                 VARCHAR,
                            pod                   VARCHAR,
                            subdivisionSection    VARCHAR,
                            parking               VARCHAR,
                            garage                VARCHAR,
                            interestCommon        VARCHAR,
                            phase                 VARCHAR,
                            unit                  VARCHAR,
                            storage               VARCHAR,
                            wine                  VARCHAR,
                            
                            revised               VARCHAR,
                            longLegal             TEXT,
                            type                  VARCHAR,
                            gmd                   VARCHAR,
                            zones                 TEXT,
                            rtv                   VARCHAR,
                            dbPg                  VARCHAR,
                            jtwros                VARCHAR,
                            note                  TEXT,
                            
                            salesCount            INTEGER,
                            status                VARCHAR             NOT NULL,
                            lastTitleStep         VARCHAR,
                            apartment             VARCHAR,
                            chainTitleType        VARCHAR,
                            certifiedByUser       INTEGER  DEFAULT 0 NOT NULL,
                            
                            apiId                 INTEGER,
                            source                VARCHAR(100) DEFAULT 'gotitle',
                            syncedAt              DATETIME,
                            legalAddress          VARCHAR,
                            mainInvoice           INTEGER,
                            initialCustomer       INTEGER,
                            currentOwnerDeedList  TEXT,
                            tokenReportPdf        VARCHAR,
                            currentOwnerDeedId    INTEGER,
                            
                            createdAt             DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            updatedAt             DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
                            
                            ownerId               INTEGER,
                            locationId            INTEGER UNIQUE,
                            FOREIGN KEY (ownerId) REFERENCES users (id),
                            FOREIGN KEY (locationId) REFERENCES locations (id),
                            FOREIGN KEY (initialCustomer) REFERENCES customer (id),
                            FOREIGN KEY (currentOwnerDeedId) REFERENCES deed (id)
                            );`);

        queryRunner.query(`INSERT INTO titles SELECT
                            tt.id,
                            tt.price,
                            tt.searchType,
                            tt.searchTypeDetail, 
                            tt.searchTypeDetailValue, 
                            tt.dateSearch, 
                            tt.dateEffective,
                            tt.condoName,
                            tt.district,
                            tt.landLot,
                            tt.section,
                            tt.township,
                            tt.range,
                            tt.lot,
                            tt.block,
                            tt.pod,
                            tt.subdivisionSection,
                            tt.parking,
                            tt.garage,
                            tt.interestCommon,
                            tt.phase,
                            tt.unit,
                            tt.storage,
                            tt.wine,
                                                        
                            tt.revised,
                            tt.longLegal,                         
                            tt.type,
                            tt.gmd,
                            tt.zones,                          
                            tt.rtv,
                            tt.dbPg,
                            tt.jtwros,
                            tt.note,   
                                                   
                            tt.salesCount,
                            tt.status,
                            tt.lastTitleStep,
                            tt.apartment,
                            tt.chainTitleType,
                            tt.certifiedByUser,
                            
                            tt.apiId,
                            tt.source,
                            tt.syncedAt,
                            tt.legalAddress,
                            tt.mainInvoice,
                            tt.initialCustomer,
                            tt.currentOwnerDeedList,
                            tt.tokenReportPdf,
                            tt.currentOwnerDeedId,
                                                        
                            tt.createdAt,
                            tt.updatedAt,
                            
                            tt.ownerId,
                            tt.locationId
                            FROM tmp_titles AS tt;`);

        queryRunner.query(`DROP TABLE IF EXISTS tmp_titles;`);

        console.warn("Remove parcel in title");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`ALTER TABLE titles ADD parcel VARCHAR;`);

        console.warn("Add parcel in title");
    }

}
