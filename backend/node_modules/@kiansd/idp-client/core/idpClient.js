import jwt from 'jsonwebtoken';

export function createIdpClient({ baseUrl, publicKey }) {
  return {
    //login
    async requestTokens(username, password) {
      const res = await fetch(`${baseUrl}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      if (!res.ok) throw new Error('Could not login');

      const { accessToken, refreshToken } = await res.json();
      return { accessToken, refreshToken };
    },
    
    async requestNewAccessToken(refreshToken) {
      const res = await fetch(`${baseUrl}/token`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!res.ok) throw new Error('Could not refresh token');

      const { accessToken } = await res.json();
      return accessToken;
    },

    async deleteRefreshToken(token) {
      const res = await fetch(`${baseUrl}/logout`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) throw new Error('Could not log out');
    },
    
    verifyAccessToken(token) {
      try {
        // Specify algorithm so JWT knows it should verify using RSA
        return jwt.verify(token, publicKey, { algorithms: ['RS256'] });
      } catch (err) {
        throw new Error('Invalid token');
      }
    }   
  };
}