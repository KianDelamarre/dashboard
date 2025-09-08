require('dotenv').config()

const express = require('express')
const cors = require('cors')

const { authenticateToken } = require('./authServer.js')

const app = express()


const jwt = require('jsonwebtoken')

const links = require('./links.json')
const db = new sqlite3.Database('./database.db')

console.log(links)

const corsOptions = {
    origin: 'https://example.com',
    credentials: true,
}

app.use(express.json(), cors(corsOptions))

app.get('/links', authenticateToken, (req, res) => {
    res.json(links)
})

app.post('./link', authenticateToken, (req, res) => {
    const localIp = req.body.localIp
    const remoteIp = req.body.remoteIp
    const imgUrl = req.body.imgUrl


})



// app.post('/login', (req, res) => {
//     //authenticate user
//     const username = req.body.username
//     const user = { name: username }

//     // sign the access token using the user(payload) and access token secret
//     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
//     res.json({ accessToken: accessToken })
// })





// login flow 
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow 
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) => 
// =>pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username

app.listen(3001)