require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { writeDataToFile } = require('./utils.js')
// const usersJson = require('./users.json')
const corsOptions = {
    origin: 'http://127.0.0.1:8080',
    credentials: true,
}

app.use(express.json(), cors(corsOptions), cookieParser())



let refreshTokens = []


let users = require('./users.json')
console.log(users)

app.delete('/logout', (req, res) => {
    refreshTokens = refreshTokens.filter(token => token !== req.cookies.token)

    res.clearCookie('refreshToken', { path: '/' });
    res.sendStatus(204)
})


app.post('/token', (req, res) => {
    // const refreshToken = req.body.token
    const refreshToken = req.cookies.refreshToken
    // console.log(`cookie = ${req.cookies}`)
    console.log(req.cookies.refreshToken)




    if (refreshToken == null) return res.sendStatus(401) //if null
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)  //if not null but does not exist in refresh token array

    jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, user) => {   //then verify

        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })

        res.json({ accessToken: accessToken })
    })
})

app.post('/login', async (req, res) => {
    //authenticate user
    const username = req.body.username;
    const password = req.body.password;
    await authenticateUser(req, res, username, password)

    const user = { name: username }

    // sign the access token using the user(payload) and access token secret
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESS_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        // secure: true,
        // sameSite: "Strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
    )
    res.json({ accessToken: accessToken })
})

function generateAccessToken(user) {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '300s' })
}

async function authenticateUser(req, res, username, password) {
    const user = users.find(u => u.username === username)
    if (!user) return res.sendStatus(401)

    const validPassword = await bcrypt.compare(password, user.password)
    if (!validPassword) return res.sendStatus(401);
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

app.listen(4000)