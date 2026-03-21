// import 'dotenv/config'

export function createLoginController({ client, cookieOptions }) {
  return async function loginController(req, res) {
    try {
      const { username, password } = req.body;
      const { accessToken, refreshToken } = await client.requestTokens(username, password);

      res.cookie('refreshToken', refreshToken, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      res.json({ accessToken });
    } catch (err) {
      res.status(401).json({ message: err.message });
    }
  };
}

export function createRequestNewAccessTokencontroller({ client }) {
  return async function requestNewAccessTokencontroller(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken
      const accessToken = await client.requestNewAccessToken(refreshToken)
      res.json({ accessToken: accessToken })
    }
    catch (err) {
      res.status(403).json({ message: err.message })
    }
  }
}

export function createLogoutController({ client, cookieOptions }) {
  return async function logoutController(req, res) {
    try {
      const refreshToken = req.cookies.refreshToken;
      console.log("idp client logout controller has refresh token", refreshToken)
      if (refreshToken) {
        await client.deleteRefreshToken(refreshToken);
      }

      res.clearCookie('refreshToken', { ...cookieOptions });
      res.sendStatus(204);
    } catch (err) {
      console.error('Logout failed:', err);
      res.status(500).json({ message: err.message });
    }
  }
}


// export async function registerController(req, res) {
//     //hard block anyone but user 1 from creating new users for now
//     if (req.user.id != 1) {
//         res.sendStatus(403)
//         return
//     }

//     try {
//         const userNameToCreate = req.body.username
//         const passwordToCreate = req.body.password
//         await registerService(userNameToCreate, passwordToCreate)
//         res.sendStatus(201)
//     }
//     catch (err) {
//         res.status(400).json({ message: err.message || err });
//     }
// }

// login flow
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) =>
// => pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username


// REFRESH TOKEN
// on login user is given refresh token => when access token expires => 
// => user request new access token with refresh token, to revalidate sessions without having to log back in =>
// => when user logs out, refresh token is delete 
