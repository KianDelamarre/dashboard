require('dotenv').config()

const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

const { authenticateToken, generateAccessToken, generateResetToken, authenticateUser } = require('./utils/auth.js')
const batchInsert = require('./utils/reorder.js')
const { createLink, updateLink, deleteLink, getLinks } = require('./utils/utils.js')

const app = express()

const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const links = require('./links.json')
const db = new sqlite3.Database('./database.db')

const dev_mode = process.env.DEV_MODE
let cookieOptions = {}
if (dev_mode === 'true') {
    cookieOptions = {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: false,
    }
}
else { //production mode
    cookieOptions = {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        secure: true
    }
}
// console.log(links)
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS,
    credentials: true,
}

console.log(corsOptions)


app.use(express.json(), cors(corsOptions), cookieParser())

let refreshTokens = []

let users = require('./users.json')


app.post('/token', (req, res) => {
    // const refreshToken = req.body.token
    const refreshToken = req.cookies.refreshToken
    // console.log(`cookie = ${req.cookies}`)
    console.log(req.cookies.refreshToken)


    if (refreshToken == null) {
        console.log('no token')
        return res.sendStatus(401)
    } //if null
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
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
    )
    res.json({ accessToken: accessToken })
})

app.delete('/logout', (req, res) => {
    const token = req.cookies.refreshToken
    if (!token || !refreshTokens.includes(token)) res.sendStatus(401)
    refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken) ///remove the refresh token from the list of refresh tokens

    res.clearCookie('refreshToken', {
        ...cookieOptions
    });    //tell the client to delete the token from their cookies
    res.sendStatus(204)
})

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

// login flow
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) =>
// => pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username


// REFRESH TOKEN
// on login user is given refresh token => when access token expires => 
// => user request new access token with refresh token, to revalidate sessions without having to log back in =>
// => when user logs out, refresh token is delete 

//get all links
app.get('/links', authenticateToken, getLinks)

app.get('/links/status', (req, res) => {

})

//create a link
app.post('/link', authenticateToken, createLink)

//delete a link
app.delete('/link/:id', authenticateToken, deleteLink)

//update a links name, urls and or image
app.patch('/link/:id', authenticateToken, updateLink)

// //move an id to any position relative to another id and reorder if necesarry, or to an empty column
// app.patch('/links/move', authenticateToken, async (req, res) => {
//     const idToMove = Number(req.body.idToMove)
//     const relativeToId = Number(req.body.relativeToId)
//     let targetColumn = Number(req.body.targetColumn)
//     console.log(idToMove, relativeToId, targetColumn);

//     await moveIdToPositionAndReindex(idToMove, relativeToId, targetColumn);
//     res.status(200).json({ "message": `${idToMove} succesfully moved` })
// })


app.patch('/links/batchmove', authenticateToken, async (req, res) => {
    await batchInsert(req)
    res.sendStatus(200)
})




async function batchDelete(arrayOfIdsToDelete) {
    for (let i = 0; i < arrayOfIdsToDelete.length; i++) {
        const id = arrayOfIdsToDelete[i].id
        db.run('DELETE FROM links WHERE id = ?', [id], (err) => {
            if (err) throw err
        })
    }
}


// login flow 
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow 
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) => 
// =>pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username

const port = 4001;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});