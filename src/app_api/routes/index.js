
const logger = require('debug-level')('hello.world')
const express = require('express')
const api = express.Router()
const Service = require('onem-nodejs-api').Service

const jwt = require('jwt-simple')

var hello = new Service('', "HELLO", '', []);

const landingMenu = hello.addMenu('./src/app_api/templates/helloLanding.pug')
landingMenu.header("HELLO WORLD MENU")

/*
 * Middleware to grab user
 */
function getUser(req, res, next) {
    if (!req.header('Authorization')) {
        logger.error("missing header")
        return res.status(401).send({ message: 'Unauthorized request' })
    }
    const token = req.header('Authorization').split(' ')[1]
    const payload = jwt.decode(token, process.env.TOKEN_SECRET)

    if (!payload) {
        return res.status(401).send({ message: 'Unauthorized Request' })
    }
    req.user = payload.sub
    next()
}


/*
 * Routes
 */
// Landing menu
api.get('/hello', getUser, async function (req, res) {
    landingMenu.data = await landingMenuData(req.user)
    res.json({ data: landingMenu.render() })
})

module.exports = api
