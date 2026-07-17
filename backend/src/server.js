import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import path from 'path';
import { fileURLToPath } from 'url';

// Load keys
import {
    createIdpClient,
    createLoginController,
    createAuthMiddleware,
    createRequestNewAccessTokencontroller,
    createLogoutController,
    getPublicKeyFromIdp
} from '@kiansd/idp-client';

import { batchMoveController } from './reorder/reorder.controller.js'
import { getLinksController, createLinkController, deleteLinkController, updateLinkController } from './link/link.controller.js'

// Required to use __dirname with ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendPath = path.join(__dirname, '..', '..', 'frontend')

const app = express()

const dev_mode = process.env.DEV_MODE
const auth_enabled = process.env.AUTH_ENABLED !== 'false'; // Defaults to true if not explicitly 'false'

let cookieOptions = {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: dev_mode !== 'true' && auth_enabled // Only true in production WITH auth enabled
}

const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS || 'http://localhost:3000',
    credentials: true,
}


let idp = null;
let loginController;
let logoutController;
let tokenController;
let authMiddleware;

if (auth_enabled) {
    console.log("🔒 Authentication Enabled: Connecting to IdP Server...");
    const idp_url = process.env.IDP_URL
    const publicKey = await getPublicKeyFromIdp(idp_url)

    idp = createIdpClient({
        baseUrl: idp_url,
        publicKey: publicKey,
    });

    // Use standard production controllers
    loginController = createLoginController({ client: idp, cookieOptions });
    logoutController = createLogoutController({ client: idp, cookieOptions });
    tokenController = createRequestNewAccessTokencontroller({ client: idp });
    authMiddleware = createAuthMiddleware({ client: idp });
} else {
    // -------------------------------------------------------------
//  SPOOF LAYER
// -------------------------------------------------------------
    console.log("🔓 Authentication Disabled: Spoofing Identity Provider...");

    // Fake Login: instantly drops a mock cookie and says success
    loginController = (req, res) => {
        res.cookie('accessToken', 'mock-bypass-token', cookieOptions);
        return res.json({ success: true, user: { id: 1 } });
    };

    // Fake Logout: clears the cookie
    logoutController = (req, res) => {
        res.clearCookie('accessToken', cookieOptions);
        return res.json({ success: true });
    };

    // Fake Token Refresh
    tokenController = (req, res) => res.json({ accessToken: 'mock-bypass-token' });

    // Fake Middleware: Instantly passes everyone through and mocks a user object
    authMiddleware = (req, res, next) => {
        req.user = { id: 1 };
        next();
    };
}
// -------------------------------------------------------------

app.use(express.json(), cors(corsOptions), cookieParser());

// Serve frontend static files
app.use(express.static(frontendPath));

// Fallback: for all other requests not hitting an API route, serve index.html
app.get(/^(?!\/(links|link|login|refresh)).*$/, (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
});

app.post('/token', tokenController);
app.post('/login', loginController);
app.delete('/logout', logoutController);

// Protect routes (Will either safely validate or completely auto-pass)
app.use(authMiddleware);

// Get all links
app.get('/links', getLinksController)
app.get('/links/status')
app.post('/link', createLinkController)
app.delete('/link/:id', deleteLinkController)
app.patch('/link/:id', updateLinkController)
app.patch('/links/batchmove', batchMoveController)

const port = 4001;
app.listen(port, () => {
    console.log(`Server is listening on http://localhost:${port}`);
});