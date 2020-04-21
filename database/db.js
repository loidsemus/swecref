const pgp = require("pg-promise")();
const dotenv = require("dotenv").config();

const db = pgp(process.env.DATABASE_URL);

const createEntriesTable = `CREATE TABLE IF NOT EXISTS entries
(
    giver text NOT NULL,
    receiver text NOT NULL,
    rating integer NOT NULL,
    date TIMESTAMP UNIQUE NOT NULL,
    permalink text
);`;
db.none(createEntriesTable);

module.exports = db;
