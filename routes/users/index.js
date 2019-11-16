const users = require('express').Router()
const user = require('./user')

users.get('/', (req, res) => {
    res.status(404).send('404')
})

users.get('/:username', user)

module.exports = users