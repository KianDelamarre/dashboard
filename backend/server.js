require('dotenv').config()

const express = require('express')
const cors = require('cors')
const app = express()


const jwt = require('jsonwebtoken')

const links = require('./links.json')
console.log(links)

app.use(express.json(), cors())


const posts = [
    {
        username: "kian",
        title: "post 1"
    },
    {
        username: "bob",
        title: "post 2"
    }
]


app.get('/links', authenticateToken, (req, res) => {
    res.json(links)
})

// app.post('/login', (req, res) => {
//     //authenticate user
//     const username = req.body.username
//     const user = { name: username }

//     // sign the access token using the user(payload) and access token secret
//     const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET)
//     res.json({ accessToken: accessToken })
// })

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
        next() //tells outer function to move onto the next middleware to continue the request
    })
}
// login flow 
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow 
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) => 
// =>pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username

app.listen(3000)