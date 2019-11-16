const pgp = require('pg-promise')()
const dotenv = require('dotenv').config()

const db = pgp(process.env.DATABASE_URL)

module.exports = db