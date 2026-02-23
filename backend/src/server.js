import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import fs from "fs";

// Load keys

// import { loginController, requestNewAccessTokencontroller, logoutController, registerController } from './auth/auth.controller.js'
// import { authenticateToken } from './auth/auth.middleware.js'
import { createIdpClient, createLoginController,createAuthMiddleware, createRequestNewAccessTokencontroller,createLogoutController, getPublicKeyFromIdp } from 'idp-client';
import { batchMoveController } from './reorder/reorder.controller.js'
import { getLinksController, createLinkController, deleteLinkController, updateLinkController } from './link/link.controller.js'

import { requestTokens } from './auth/auth.repository.js'
import { get } from 'http';

const app = express()

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
const idp_url = process.env.IDP_URL
// const publicKey = fs.readFileSync("./public.key", "utf8");
const publicKey = await getPublicKeyFromIdp(idp_url)
// const pubblicKey = 'hi'
const idp = createIdpClient({
  baseUrl: idp_url,
  publicKey: publicKey,
});


// requestTokens('kian1', '1234')

app.use(express.json(), cors(corsOptions), cookieParser());
app.post('/refresh', createRequestNewAccessTokencontroller({ client: idp }));
// app.post('/token', requestNewAccessTokencontroller)
// app.post('/register', authenticateToken, registerController)
app.post('/login', createLoginController({ client: idp, cookieOptions}));
// app.post('/login', (req, res) => { loginController(req, res, cookieOptions) })
// app.delete('/logout', (req, res) => { logoutController(req, res, cookieOptions) })
// app.post('/request-reset', requestPasswordReset )
// app.put('/reset-password', authenticateToken, resetPassword)

// Protect routes
app.use(createAuthMiddleware({ client: idp }));
//get all links
app.get('/links', getLinksController)
//ping links to check up status
app.get('/links/status')
//create a link
app.post('/link', createLinkController)
//delete a link
app.delete('/link/:id', deleteLinkController)
//update a links name, urls and or image
app.patch('/link/:id', updateLinkController)
//to reorder multiple links at the same time
app.patch('/links/batchmove', batchMoveController)

const port = 4001;
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});