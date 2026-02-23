import 'dotenv/config'
import { authenticateUser,
    generateAccessToken,
    generateRefreshToken,
     storeRefreshToken,
     checkRefreshToken,
     deleteRefreshToken,
     hashPassword,
     registerNewUser
     } from './auth.repository.js'


export async function loginService(username, password) {
    if (!username || !password)
        throw new Error('invalid username or password')

    try {
        //authenticate user
        const user = await authenticateUser(username, password)
        //generate access token
        const accessToken = generateAccessToken(user)
        //generate refresh token
        const refreshToken = generateRefreshToken(user)
        //store refresh token
        await storeRefreshToken(user.id, refreshToken)
        //return both tokens
        console.log(accessToken, refreshToken)
        return { accessToken, refreshToken }
    }
    catch (err) {
        throw new Error('invalid username or password')
    }

}

export async function requestNewAccessTokenService(refreshToken) {
    if (!refreshToken) {
        throw new Error('invalid token')
    }

    try {
        await checkRefreshToken(refreshToken) //validate token in db
        const accessToken = generateAccessToken(user)
        return accessToken
    }
    catch (err) {
        console.log('user trying to reauthenticate without valid token, make sure credentials true')
        throw new Error('invalid token')
    }
}

export async function logoutService(refreshToken) {
    if (!refreshToken) {
        throw new Error('invalid token')
    }

    try {
        await deleteRefreshToken(refreshToken)
    }
    catch (err) {
        throw new Error('invalid token')
    }
}

export async function registerService(userNameToCreate, passwordToCreate) {
    if (!userNameToCreate || !passwordToCreate) {
        throw new Error('invalid input')
    }
    try {
        const password_hash = await hashPassword(passwordToCreate)
        await registerNewUser(userNameToCreate, password_hash)
    }
    catch (err) {
        throw err
    }


}



// function requestPasswordReset(req, res) {
//     const username = req.body.username
//     if (!username || !users.includes(username)) res.sendStatus(401)

//     const resetToken = generateResetToken(username)

//     //hash and add reset token to database allong with used bool and link to user its for

//     const resetPasswordUrl = `https://example.com/reset?token=${resetToken}` //takes the client to the location on the frontend to make reset their password, on reset, the form will be submitted to the /resetpassword endpoint

//     ///email resetPasswordUrl to email, should probably switch from username to email in this case

//     //frontend needs to extract resetToken from url then send it in the resetpassword request as authorisation header
// })

// fucntion resetPassword() { ///need a different authenticateToken as this one uses the accessToken secret, not the reset token secret
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