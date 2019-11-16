const db = require('./db')

function add(entry) {
    const text = `INSERT INTO 
    entries(giver, receiver, rating, date, permalink)
    VALUES($1, $2, $3, to_timestamp($4 / 1000.0), $5)
    ON CONFLICT (date) DO UPDATE SET
    giver = EXCLUDED.giver,
    receiver = EXCLUDED.receiver,
    rating = EXCLUDED.rating,
    permalink = EXCLUDED.permalink;`

    const values = [
        entry.giver,
        entry.receiver,
        entry.rating,
        entry.date,
        entry.permalink
    ]

    db.none(text, values)
        .catch(error => {
            console.log('Error on inserting row')
        });
}

/**
 * @typedef {Object} User
 * @property 
 */
/**
 * 
 * @param {string} user - Username to be displayed 
 * @returns {User}
 */
async function getUser(user) {
    const userInfo = {}

    const receiverText = `SELECT * FROM entries WHERE LOWER(receiver) = LOWER($1)`
    const giverText = `SELECT * FROM entries WHERE LOWER(giver) = LOWER($1)`
    const values = [user]


    try {
        const given = await db.any(giverText, values)
        const received = await db.any(receiverText, values)


        given.forEach((entry) => {
            delete entry.id
            delete entry.giver
        })

        received.forEach((entry) => {
            delete entry.id
            delete entry.receiver
        })

        userInfo.given = given
        userInfo.received = received
    } catch (error) {
        console.log(error)
    }

    return userInfo
}

module.exports = {
    add: add,
    getUser: getUser
}