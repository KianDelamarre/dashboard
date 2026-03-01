export function createAuthMiddleware({ client }) {
  return function authenticateToken(req, res, next) {
    try {
      const authHeader = req.headers['authorization'];
      const token = authHeader?.split(' ')[1];
      if (!token) return res.sendStatus(401);

      req.user = client.verifyAccessToken(token);
      req.token = token;
      next();
    } catch {
      res.sendStatus(403);
    }
  };
}