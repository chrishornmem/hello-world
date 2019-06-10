require('dotenv').config();

const logger = require('debug-level')('hello-world')

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const morgan = require('morgan')
const path = require('path')
const methodOverride = require('method-override')
const bodyParser = require('body-parser')
const errorHandler = require('errorhandler')
const config = require('./app_api/common/config')

// Bring in the routes for the API (delete the default routes)
const api   = require('./app_api/routes/index.js')
const mode = app.get('env').toLowerCase()

let public_folder

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(methodOverride())

// Use the API routes when path starts with /api
app.use('/api', api)

if (mode === 'development') {
    app.use(morgan('dev'))
    app.use(errorHandler())
    public_folder = 'app_client'
} else {
    public_folder = 'public'
}

logger.info("public_folder:" + public_folder)

app.use(express.static(path.join(__dirname, public_folder)))

if (config.https.toLowerCase() == 'true' || config.https) {
    app.use(function(req, res, next) {
        const protocol = req.get('x-forwarded-proto')
        protocol == 'https' ? next() : res.redirect('https://' + req.hostname + req.url)
    })
}

app.get('/', function(req, res, next) {
    res.sendFile('/' + public_folder + '/index.html', { root: __dirname })
})

app.get('*', function(req, res) {
    res.sendFile('/' + public_folder + '/index.html', { root: __dirname })
})

app.get('/*', function(req, res, next) {
    // Just send the index.html for other files to support HTML5Mode
    res.sendFile('/' + public_folder + '/index.html', { root: __dirname })
})

server.listen(config.httpPort)
logger.info("listening on port:" + config.httpPort)

module.exports = app
