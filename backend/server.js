// require('dotenv').config()

const express = require('express')
const cors = require('cors')

const auth = require('./utils/auth.js')
const reorder = require('./utils/reorder.js')
const { createLink, updateLink, deleteLink, getLinks } = require('./utils/utils.js')

const app = express()

const cookieParser = require('cookie-parser')

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

app.post('/token', auth.requestNewToken)
app.post('/login', (req, res) => { auth.login(req, res, cookieOptions) })
app.delete('/logout', (req, res) => { auth.logout(req, res, cookieOptions) })
// app.post('/request-reset', requestPasswordReset )
// app.put('/reset-password', authenticateToken, resetPassword)

//get all links
app.get('/links', auth.authenticateToken, getLinks)
//ping links to check up status
app.get('/links/status')
//create a link
app.post('/link', auth.authenticateToken, createLink)
//delete a link
app.delete('/link/:id', auth.authenticateToken, deleteLink)
//update a links name, urls and or image
app.patch('/link/:id', auth.authenticateToken, updateLink)
//to reorder multiple links at the same time
app.patch('/links/batchmove', auth.authenticateToken, reorder.batchMove)

const port = 4001;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});