const entries = require('../../database/entries')

module.exports = async (req, res) => {
    const userEntries = await entries.getUser(req.params.username)
    res.status(200).send(userEntries)
}