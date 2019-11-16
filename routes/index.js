const routes = require('express').Router()
const users = require('./users')

routes.get('/', (req, res) => {
    res.status(404).send('404')
})

routes.use('/users', users)

module.exports = routes