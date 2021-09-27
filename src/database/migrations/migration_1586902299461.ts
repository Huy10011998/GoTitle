import {MigrationInterface, QueryRunner} from "typeorm";

export class migration_1586902299461 implements MigrationInterface {

    async up(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(` INSERT INTO deed_type ("id", "name", "code", "scope", "docType", "createdAt", "updatedAt") VALUES
          (NULL, "Security Deed", "security_deed", "master", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Mortgage", "mortgage", "master", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Deed to Secure Debt", "deed_to_secure_debt", "master", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Deed of Trust", "deed_of_trust", "master", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Assignment/Transferred", "assignment_transferred", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Re-Recorded", "re_recorded", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "UCC", "ucc", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Affidavit", "affidavit", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Amended", "amended", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Assignment Leases and Rents", "assignment_leases_and_rent", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Cancelled", "cancelled", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Corrective", "corrective", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Modified", "modified", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Naked Cancellation", "naked_cancellation", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Wiped", "wiped", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Subordinated", "subordinated", "secondary", "mortgage", current_timestamp, current_timestamp),
          (NULL, "Assumption", "assumption", "secondary", "mortgage", current_timestamp, current_timestamp),
        
          (NULL, "Warranty Deed", "warranty_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Quitclaim Deed", "quitclaim_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Administrator Deed", "administrator_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Executor Deed", "executor_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Executrix Deed", "executrix_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Deed of Gift", "deed_of_gift", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "General Warranty Deed", "general_warranty_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Limited Warranty Deed", "limited_warranty_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Special Warranty Deed", "special_warranty_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Limited and Special Warranty Deed", "limited_and_special_warranty_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Deed in Lieu of Foreclosure", "deed_in_lieu_of_foreclosure", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Foreclosure Deed", "foreclosure_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Deed Under Power", "deed_under_power", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Trustee Deed", "trustee_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Tax Deed", "tax_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Order Deed", "order_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Corrective Warranty Deed", "corrective_warranty_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Corrective Executor Deed", "corrective_executor_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Deed of Assent", "deed_of_assent", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Year Support", "year_support", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Sheriff Fee Simple Deed", "sheriff_fee_simple_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Warranty Deed of Gift", "warranty_deed_of_gift", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Survivorship Deed", "survivorship_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Corrective Deed Under Power", "corrective_deed_under_power", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Corrective Quitclaim Deed", "corrective_quitclaim_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Lease Agreement", "lease_agreement", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Limited Trustee Deed", "limited_trustee_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Grant Deed", "grant_deed", "master", "deed", current_timestamp, current_timestamp),
          (NULL, "Receiver Deed", "receiver_deed", "master", "deed", current_timestamp, current_timestamp),
          
          (NULL, "Federal Tax Lien", "federal_tax_lien", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Mechanic and Materialman Lien", "mechanic_and_materialman_lien", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Lis Pendens", "lis_pendens", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Statutory Lien", "statutory_lien", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Lien", "lien", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "State Tax Execution", "state_tax_execution", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Writ of Fieri Facias", "writ_of_fieri_facias", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Affidavit", "affidavit", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Attorney Lien", "attorney_lien", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Judgment", "judgment", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "DOJ Lien", "doj_lien", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Writ of Execution", "writ_of_execution", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Property Tax", "property_tax", "master", "lien", current_timestamp, current_timestamp),
          (NULL, "Assignment/Transferred", "assignment_transferred", "secondary", "lien", current_timestamp, current_timestamp),
          (NULL, "Nulla Bona", "nulla_bona", "secondary", "lien", current_timestamp, current_timestamp),
          (NULL, "Affidavit", "affidavit_secondary", "secondary", "lien", current_timestamp, current_timestamp),
          (NULL, "Amended", "amended", "secondary", "lien", current_timestamp, current_timestamp),
          (NULL, "Cancelled", "cancelled", "secondary", "lien", current_timestamp, current_timestamp),
          (NULL, "Corrective", "corrective", "secondary", "lien", current_timestamp, current_timestamp),
          (NULL, "Re-Recorded", "re_recorded", "secondary", "lien", current_timestamp, current_timestamp),
        
          (NULL, "Plat", "plat", "master", "plat_floor_plan", current_timestamp, current_timestamp),
          (NULL, "Floor Plan", "floor_plan", "master", "plat_floor_plan", current_timestamp, current_timestamp),
          (NULL, "Revised Plat", "revised_plat", "secondary", "plat_floor_plan", current_timestamp, current_timestamp),
          (NULL, "Revised Floor Plan", "revised_floor_plan", "secondary", "plat_floor_plan", current_timestamp, current_timestamp),
        
          (NULL, "Right of Way", "right_of_way", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "General Easement", "general_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Drainage Easement", "drainage_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Sanitary Sewer Easement", "sanitary_sewer_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Electric Utility  Easement", "electric_utility_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Right of Flight", "right_of_flight", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Construction Easement", "construction_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "GA Power Easement", "ga_power_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Driveway Easement", "driveway_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Temporary Construction Easement", "temporary_construction_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Utility Easement", "utility_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Construction and Maintenance Easement", "construction_and_maintenance_easement", "master", "easement", current_timestamp, current_timestamp),
          (NULL, "Environmental Inspection Easement", "environmental_inspection_easement", "master", "easement", current_timestamp, current_timestamp) ,
        
          (NULL, "Lease", "lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "General Lease", "general_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Limited Lease", "limited_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Ground Lease", "ground_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Cell Tower Lease", "cell_tower_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Tower Lease", "tower_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Commercial Lease", "commercial_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Rental Agreement", "rental_agreement", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Easement Lease", "easement_lease", "master", "lease", current_timestamp, current_timestamp),
          (NULL, "Georgia Power Lease", "georgia_power_lease", "master", "lease", current_timestamp, current_timestamp),
          
          (NULL, "Miscellaneous", "miscellaneous", "master", "misc_civil_probate", current_timestamp, current_timestamp),
          (NULL, "Civil", "civil", "master", "misc_civil_probate", current_timestamp, current_timestamp),
          (NULL, "Probate", "probate", "master", "misc_civil_probate", current_timestamp, current_timestamp),
          (NULL, "Tax", "tax", "master", "tax", current_timestamp, current_timestamp)
        ;`);
        console.log("Deed Type Seeded");
    }

    async down(queryRunner: QueryRunner): Promise<any> {
        queryRunner.query(`DELETE FROM deed_type;`)
        console.log("Deed Type Data Cleaned");
    }

}
