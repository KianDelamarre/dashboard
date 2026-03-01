import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// Load keys
import { createIdpClient, createLoginController,createAuthMiddleware, createRequestNewAccessTokencontroller,createLogoutController, getPublicKeyFromIdp } from '@kiansd/idp-client';
import { batchMoveController } from './reorder/reorder.controller.js'
import { getLinksController, createLinkController, deleteLinkController, updateLinkController } from './link/link.controller.js'

// import path from 'path';
// import { fileURLToPath } from 'url';


// // Required to use __dirname with ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);
// const frontendPath = path.join(__dirname, '..', '..', 'frontend')

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
const publicKey = await getPublicKeyFromIdp(idp_url)
const idp = createIdpClient({
  baseUrl: idp_url,
  publicKey: publicKey,
});


// requestTokens('kian1', '1234')

app.use(express.json(), cors(corsOptions), cookieParser());

// // Serve frontend static files
// app.use(express.static(frontendPath));

// // Fallback: for all other requests not hitting an API route, serve index.html
// app.get(/^(?!\/(links|link|login|refresh)).*$/, (req, res) => {
//   res.sendFile(path.join(frontendPath, 'index.html'));
// });

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