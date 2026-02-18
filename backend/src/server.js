// require('dotenv').config()

const express = require('express')
const cors = require('cors')

const {loginController, requestNewAccessTokencontroller, logoutController, registerController} = require('./controllers/auth.controller.js')
const {authenticateToken} = require('./middleware/auth.middleware.js')
const {batchMoveController} = require('./controllers/reorder.controller.js')
const { getLinksController, createLinkController, deleteLinkController, updateLinkController } = require('./controllers/link.controller.js')

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

app.post('/token', requestNewAccessTokencontroller)
app.post('/register', authenticateToken, registerController)
app.post('/login', (req, res) => {loginController(req, res, cookieOptions) })
app.delete('/logout', (req, res) => { logoutController(req, res, cookieOptions) })
// app.post('/request-reset', requestPasswordReset )
// app.put('/reset-password', authenticateToken, resetPassword)

//get all links
app.get('/links', authenticateToken, getLinksController)
//ping links to check up status
app.get('/links/status')
//create a link
app.post('/link', authenticateToken, createLinkController)
//delete a link
app.delete('/link/:id', authenticateToken, deleteLinkController)
//update a links name, urls and or image
app.patch('/link/:id', authenticateToken, updateLinkController)
//to reorder multiple links at the same time
app.patch('/links/batchmove', authenticateToken, batchMoveController)

const port = 4001;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});