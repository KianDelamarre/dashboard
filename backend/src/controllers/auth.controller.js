require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const {loginService, requestNewAccessTokenService, logoutService} = require('../services/auth.service.js')

const { writeDataToFile } = require('../utils/utils.js')
const db = require('../db/db.js');

async function loginController(req, res, cookieOptions) {
    try {
        const {username, password} = req.body
        const {accessToken, refreshToken} = await loginService(username, password)
        // refreshTokens.push(refreshToken)
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        }
        )
        res.json({ accessToken: accessToken })
    }
    catch (err) {
        return res.status(401).json({ message: err.message })
    }
}

async function requestNewAccessTokencontroller(req, res) {
    try {
        const refreshToken = req.cookies.refreshToken
        const accessToken = await requestNewAccessTokenService(refreshToken)
        res.json({ accessToken: accessToken })
    }
    catch (err) {
        res.status(403).json({ message: err.message })
    }
}

async function logoutController(req, res, cookieOptions) {
    try {
        const refreshToken = req.cookies.refreshToken
        await logoutService(refreshToken)
        res.clearCookie('refreshToken', {
            ...cookieOptions
        });    //tell the client to delete the token from their cookies
        res.sendStatus(204)
    }
    catch (err) {
        res.status(401).json({ message: err.message })
    }
}

async function registerController(req, res) {
    //hard block anyone but user 1 from creating new users for now
    if (req.user.id != 1) {
        res.sendStatus(403)
        return
    }

    try {
        const userNameToCreate = req.body.username
        const passwordToCreate = req.body.password
        await registerService(userNameToCreate, passwordToCreate)
        res.sendStatus(201)
    }
    catch (err) {
        res.status(400).json({ message: err.message || err });
    }
}

module.exports = {
    loginController, logoutController, requestNewAccessTokencontroller, registerController
}

// login flow
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) =>
// => pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username


// REFRESH TOKEN
// on login user is given refresh token => when access token expires => 
// => user request new access token with refresh token, to revalidate sessions without having to log back in =>
// => when user logs out, refresh token is delete 
