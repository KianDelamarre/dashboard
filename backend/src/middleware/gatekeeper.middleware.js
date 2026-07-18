
// Guard the login route BEFORE tokens are generated
export const restrictLoginToAllowedUser = (req, res, next) => {
    const auth_enabled = process.env.AUTH_ENABLED !== 'false';
    const ALLOWED_USER = process.env.ALLOWED_USER;

    if (auth_enabled && ALLOWED_USER) {
        // Intercept the login body
        if (!req.body || req.body.username !== ALLOWED_USER) {
            console.warn(`🛑 Blocked login attempt from unauthorized user: ${req.body?.username}`);
            return res.status(403).json({ error: "Forbidden: You do not have access to this dashboard." });
        }
    }
    next();
};

// Guard your data routes AFTER tokens are verified
export const verifyRouteAccess = (req, res, next) => {
    const auth_enabled = process.env.AUTH_ENABLED !== 'false';
    const ALLOWED_USER = process.env.ALLOWED_USER;

    if (auth_enabled && ALLOWED_USER) {
        // Read from the token payload populated by authMiddleware
        const authenticatedUser = req.user?.username

        if (authenticatedUser !== ALLOWED_USER) {
            console.warn(`🛑 Blocked API access attempt from: ${authenticatedUser}`);
            return res.status(403).json({ error: "Forbidden: Access denied." });
        }
    }
    next();
};