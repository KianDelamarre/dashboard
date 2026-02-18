require('dotenv').config()
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const { writeDataToFile } = require('../utils/utils.js')
const db = require('../db/db.js');

async function loginService(username, password) {
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

async function requestNewAccessTokenService(refreshToken) {
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

async function logoutService(refreshToken) {
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

async function registerService(userNameToCreate, passwordToCreate) {
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


async function registerNewUser(username, passowrd_hash) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO users (username, password_hash) VALUES (?,?)', [username, passowrd_hash], (err) => {
            if (err) reject(err)
            resolve(this.lastID)
        })
    })
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
    const session = await new Promise((resolve, reject) => {
        db.get(`SELECT refresh_token_hash FROM sessions WHERE refresh_token_hash = ?`, [token], (err, row) => {
            if (err) reject(err);
            resolve(row)
        })
    })

    if (!session) {
        throw new Error('Invalid or revoked refresh token')
    }
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

//     const resetPasswordUrl = `https://kianserver.uk/reset?token=${resetToken}` //takes the client to the location on the frontend to make reset their password, on reset, the form will be submitted to the /resetpassword endpoint

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
    const payload = { id: user.id, username: user.username };
    return jwt.sign(payload, process.env.RESET_TOKEN_SECRET, { expiresIn: '300s' }) //shorter expiration time and will be single use
}

async function authenticateUser(username, password) {
    if (!username || !password) throw new Error('invalid username or passsword')
    try {
        const user = await getUser(username);
        const storedHash = user.password_hash
        await verifyPassword(password, storedHash)
        return user;
    }
    catch (err) {
        throw new Error('invalid username or passsword')
    }
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

// auth.service.js
function verifyAccessToken(token) {
    try {
        return jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    } catch {
        throw new Error('Invalid token');
    }
}

function verifyRefreshToken(token) {
    try {
        return jwt.verify(token, process.env.REFRESS_TOKEN_SECRET_TOKEN_SECRET);
    } catch {
        throw new Error('Invalid token');
    }
}


async function hashPassword(password) {
    const saltRounds = 10; // cost factor, 10 is standard

    const hashedPassword = await bcrypt.hash(password, saltRounds);
    console.log(hashedPassword)
    return hashedPassword
}

async function verifyPassword(password, storedHash) {
    if (!password || !storedHash) {
        throw new Error('invalid password')
    }
    try {
        await bcrypt.compare(password, storedHash)
    }
    catch (err) {
        throw err
    }
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
    loginService,
    requestNewAccessTokenService,
    logoutService,
    registerService,
    verifyAccessToken,
    authenticateUser,
    storeRefreshToken,
    generateAccessToken,
    generateRefreshToken,
    getUser,
    verifyPassword
}