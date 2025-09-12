require('dotenv').config()

const express = require('express')
const app = express()
const cors = require('cors')
const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { writeDataToFile } = require('./utils.js')
// const usersJson = require('./users.json')
// const corsOptions = {
//     origin: 'https://kianserver.uk',
//     credentials: true,
// }

// app.use(express.json(), cors(corsOptions), cookieParser())



let refreshTokens = []


let users = require('./users.json')
// // console.log(users)

// app.post('/token', (req, res) => {
//     // const refreshToken = req.body.token
//     const refreshToken = req.cookies.refreshToken
//     // console.log(`cookie = ${req.cookies}`)
//     console.log(req.cookies.refreshToken)


//     if (refreshToken == null) {
//         console.log('no token')
//         return res.sendStatus(401)
//     } //if null
//     if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)  //if not null but does not exist in refresh token array

//     jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, user) => {   //then verify

//         if (err) return res.sendStatus(403)
//         const accessToken = generateAccessToken({ name: user.name })

//         res.json({ accessToken: accessToken })
//     })
// })

// app.post('/login', async (req, res) => {
//     //authenticate user
//     const username = req.body.username;
//     const password = req.body.password;
//     await authenticateUser(req, res, username, password)

//     const user = { name: username }

//     // sign the access token using the user(payload) and access token secret
//     const accessToken = generateAccessToken(user)
//     const refreshToken = jwt.sign(user, process.env.REFRESS_TOKEN_SECRET)
//     refreshTokens.push(refreshToken)
//     res.cookie("refreshToken", refreshToken, {
//         httpOnly: true,
//         secure: true,
//         sameSite: "Strict",
//         path: "/",
//         maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
//     }
//     )
//     res.json({ accessToken: accessToken })
// })

// app.delete('/logout', (req, res) => {
//     const token = req.cookies.refreshToken
//     if (!token || !refreshTokens.includes(token)) res.sendStatus(401)
//     refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken) ///remove the refresh token from the list of refresh tokens

//     res.clearCookie('refreshToken', {
//         path: '/',
//         httpOnly: true,
//         secure: true,
//         sameSite: "Strict"
//     });    //tell the client to delete the token from their cookies
//     res.sendStatus(204)
// })

// app.post('/request-reset', (req, res) => {
//     const username = req.body.username
//     if (!username || !users.includes(username)) res.sendStatus(401)

//     const resetToken = generateResetToken(username)

//     //hash and add reset token to database allong with used bool and link to user its for

//     const resetPasswordUrl = `https://kianserver.uk/reset?token=${resetToken}` //takes the client to the location on the frontend to make reset their password, on reset, the form will be submitted to the /resetpassword endpoint

//     ///email resetPasswordUrl to email, should probably switch from username to email in this case

//     //frontend needs to extract resetToken from url then send it in the resetpassword request as authorisation header
// })

// app.put('/reset-password', authenticateToken, (req, res) => { ///need a different authenticateToken as this one uses the accessToken secret, not the reset token secret
//     const user = req.body.user
//     const newPassword = req.body.password
//     const resetToken = req.body.token

//     //first select the row where username = user and resetToken = reset token, return bad status code if no ecntry
//     //first check token used status, if used then return bad status code ( this is just for if two reset requests come at the same time)
//     //   if token not used, set to used

//     //since token and user match and token unused, newPassword and change it for the user


// })



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




// app.listen(4001)

// if (require.main === module) {
//     // Only run if this file is executed directly, not when required
//     const port = 4001;
//     app.listen(port, () => console.log(`authServer is listening on port ${port}`));
// }

module.exports = {
    authenticateToken, generateAccessToken, generateResetToken, authenticateUser
}