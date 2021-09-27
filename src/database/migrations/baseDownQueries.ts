const baseDownQueries = [
    `PRAGMA foreign_keys = OFF;`,
    `DROP TABLE IF EXISTS "covenant";`,
    `DROP TABLE IF EXISTS "tax";`,
    `DROP TABLE IF EXISTS "misc_civil_probate";`,
    `DROP TABLE IF EXISTS "easement";`,
    `DROP TABLE IF EXISTS "plat_floor_plan";`,
    `DROP TABLE IF EXISTS "lien";`,
    `DROP TABLE IF EXISTS "deed";`,
    `DROP TABLE IF EXISTS "mortgage";`,
    `DROP TABLE IF EXISTS "deed_type";`,
    `DROP TABLE IF EXISTS "title_book_page";`,
    `DROP TABLE IF EXISTS "title_detail";`,
    `DROP TABLE IF EXISTS "title_seller";`,
    `DROP TABLE IF EXISTS "title_buyer";`,
    `DROP TABLE IF EXISTS "titles";`,
    `DROP TABLE IF EXISTS "locations";`,
    `DROP TABLE IF EXISTS "users";`,
    `PRAGMA foreign_keys = ON;`
];

export default baseDownQueries;