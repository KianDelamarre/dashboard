require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { writeDataToFile } = require('./utils.js')
const db = require('./db.js');

async function login(req, res, cookieOptions) {
    //authenticate user
    // await hashPassword("12345")
    let user;
    try {
        user = await authenticateUser(req.body.username, req.body.password)
        console.log('user authenticated')

    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }

    try {
        // sign the access token using the user(payload) and access token secret
        const accessToken = generateAccessToken(user)
        const refreshToken = generateRefreshToken(user)
        // refreshTokens.push(refreshToken)
        await storeRefreshToken(user.id, refreshToken)
        console.log('user logging in and tokens being sent')
        res.cookie("refreshToken", refreshToken, {
            ...cookieOptions,
            maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
        }
        )
        res.json({ accessToken: accessToken })
    }
    catch (err) {
        return res.status(401).json({ message: 'Invalid username or password' });
    }
}



async function logout(req, res, cookieOptions) {
    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
        // console.log('no token')
        return res.sendStatus(401)
    } //if null

    try {
        await deleteRefreshToken(refreshToken)
        console.log('logging user out and deleting token from db')
        res.clearCookie('refreshToken', {
            ...cookieOptions
        });    //tell the client to delete the token from their cookies
        res.sendStatus(204)
    }
    catch (err) {
        return res.sendStatus(401)
    }
}



async function requestNewToken(req, res) {
    // const refreshToken = req.body.token
    const refreshToken = req.cookies.refreshToken
    // console.log(`cookie = ${req.cookies}`)
    // console.log(req.cookies.refreshToken)


    if (!refreshToken) {
        // console.log('no token')
        return res.sendStatus(401)
    } //if null
    // if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)  //if not null but does not exist in refresh token array

    try {
        const session = await checkRefreshToken(refreshToken)
        const user = jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET)
        const accessToken = generateAccessToken(user)
        console.log('user being sent new access token')
        res.json({ accessToken: accessToken })
    }
    catch (err) {
        console.log('user trying to reauthenticate without valid token, make sure credentials true')
        return res.sendStatus(403)
    }
}

async function storeRefreshToken(userId, refreshTokenHash) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO sessions
            (user_id, refresh_token_hash, expires_at) 
            VALUES (?,?,?)`, [userId, refreshTokenHash, new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()], (err) => {
            if (err) reject(err);
            resolve(this.lastID)
        })
    })
}

async function checkRefreshToken(token) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT refresh_token_hash FROM sessions WHERE refresh_token_hash = ?`, [token], (err, row) => {
            if (err) reject(err);
            resolve(row)
        })
    })
}

async function deleteRefreshToken(token) {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM sessions WHERE refresh_token_hash = ?`, [token], (err) => {
            if (err) reject(err);
            if (this.changes === 0) return reject(new Error('Token not found'));
            resolve(this.changes);
        })
    })
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




function generateAccessToken(user) {
    const payload = { id: user.id, username: user.username };
    return jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '300s' })
}
function generateRefreshToken(user) {
    const payload = { id: user.id, username: user.username };
    return jwt.sign(payload, process.env.REFRESS_TOKEN_SECRET)

}

function generateResetToken(user) {
    return jwt.sign(user, process.env.RESET_TOKEN_SECRET, { expiresIn: '300s' }) //shorter expiration time and will be single use
}

async function authenticateUser(username, password) {
    const user = await getUser(username);
    const storedHash = user.password_hash
    const validPassword = await bcrypt.compare(password, storedHash)
    if (!validPassword) throw new Error('invalid username or password')
    return user;
}

async function getUser(username) {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM users WHERE username = ?', [username], (err, row) => {
            if (err) reject(err)
            if (!row) reject(new Error('User not found'));
            else resolve(row)
        })
    })
}

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization']  //gets the authorisation header
    const token = authHeader && authHeader.split(' ')[1]  //if authHeader isnt null, token = authheader token
    if (!token) return res.sendStatus(401) //check if there is a token

    //decode the token producing an error object and payload object
    //error and payload object passed to callback as err, user
    //if error object isnt null, then payload (user) will be null, as the token or secret key arent valid
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403) //return 403 in the case that their token is invalid
        // console.log(user)
        req.user = user //when the token is valid, add the user object to the request
        req.token = token ///lazy but add token to request body to be used when resetting password
        next() //tells outer function to move onto the next middleware to continue the request
    })
}

async function hashPassword(password) {
    const saltRounds = 10; // cost factor, 10 is standard

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword)
}

setInterval(() => {
    const now = new Date().toISOString();
    db.run(
        `DELETE FROM sessions WHERE expires_at <= ?`,
        [now],
        function (err) {
            if (err) console.error('Failed to delete expired tokens', err);
            else if (this.changes > 0) console.log(`Deleted ${this.changes} expired tokens`);
        }
    );
}, 60 * 60 * 1000); // runs every hour


// login flow
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) =>
// => pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username


// REFRESH TOKEN
// on login user is given refresh token => when access token expires => 
// => user request new access token with refresh token, to revalidate sessions without having to log back in =>
// => when user logs out, refresh token is delete 

module.exports = {
    authenticateToken, login, logout, requestNewToken
}