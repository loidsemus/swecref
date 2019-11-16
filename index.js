const express = require('express')
const app = express()
const http = require('http');
const server = http.createServer(app)
const port = process.env.PORT || 3000

const schedule = require('node-schedule')
const scrapeAndSave = require('./scrape')

const routes = require('./routes')

app.use('/', routes)

// Schedule a scrape and save to database to run at 02:00 every day. 
schedule.scheduleJob('0 2 * * *', () => {
    try {
        scrapeAndSave()
    } catch (error) {
        console.log('Error: ' + error)
    }
})

server.listen(port, () => console.log(`Listening on ${port}!`))
