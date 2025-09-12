require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { writeDataToFile } = require('./utils.js')



let refreshTokens = []


let users = require('../users.json')



function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '300s' })
}

function generateResetToken(user) {
    return jwt.sign(user, process.env.RESET_TOKEN_SECRET, { expiresIn: '300s' }) //shorter expiration time and will be single use
}

async function authenticateUser(req, res, username, password) {
    const user = users.find(u => u.username === username)
    if (!user) return res.sendStatus(401)

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.sendStatus(401);
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']  //gets the authorisation header
    const token = authHeader && authHeader.split(' ')[1]  //if authHeader isnt null, token = authheader token
    if (token == null) return res.sendStatus(401) //check if there is a token

    //decode the token producing an error object and payload object
    //error and payload object passed to callback as err, user
    //if error object isnt null, then payload (user) will be null, as the token or secret key arent valid
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403) //return 403 in the case that their token is invalid
        console.log(req.user)
        req.user = user //when the token is valid, add the user object to the request
        req.token = token ///lazy but add token to request body to be used when resetting password
        next() //tells outer function to move onto the next middleware to continue the request
    })
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

module.exports = {
    authenticateToken, generateAccessToken, generateResetToken, authenticateUser
}