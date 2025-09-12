require('dotenv').config()

const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

const { authenticateToken, generateAccessToken, generateResetToken, authenticateUser } = require('./authServer.js')

const app = express()

const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const links = require('./links.json')
const db = new sqlite3.Database('./database.db')

// console.log(links)

const corsOptions = {
    origin: 'https://example.com',
    credentials: true,
}

app.use(express.json(), cors({ origin: 'https://example.com', credentials: true }), cookieParser())

let refreshTokens = []

let users = require('./users.json')


app.post('/token', (req, res) => {
    // const refreshToken = req.body.token
    const refreshToken = req.cookies.refreshToken
    // console.log(`cookie = ${req.cookies}`)
    console.log(req.cookies.refreshToken)


    if (refreshToken == null) {
        console.log('no token')
        return res.sendStatus(401)
    } //if null
    if (!refreshTokens.includes(refreshToken)) return res.sendStatus(403)  //if not null but does not exist in refresh token array

    jwt.verify(refreshToken, process.env.REFRESS_TOKEN_SECRET, (err, user) => {   //then verify

        if (err) return res.sendStatus(403)
        const accessToken = generateAccessToken({ name: user.name })

        res.json({ accessToken: accessToken })
    })
})

app.post('/login', async (req, res) => {
    //authenticate user
    const username = req.body.username;
    const password = req.body.password;
    await authenticateUser(req, res, username, password)

    const user = { name: username }

    // sign the access token using the user(payload) and access token secret
    const accessToken = generateAccessToken(user)
    const refreshToken = jwt.sign(user, process.env.REFRESS_TOKEN_SECRET)
    refreshTokens.push(refreshToken)
    res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: true,
        // sameSite: "Strict",
        path: "/",
        maxAge: 7 * 24 * 60 * 60 * 1000 // 1 week
    }
    )
    res.json({ accessToken: accessToken })
})

app.delete('/logout', (req, res) => {
    const token = req.cookies.refreshToken
    if (!token || !refreshTokens.includes(token)) res.sendStatus(401)
    refreshTokens = refreshTokens.filter(token => token !== req.cookies.refreshToken) ///remove the refresh token from the list of refresh tokens

    res.clearCookie('refreshToken', {
        path: '/',
        httpOnly: true,
        secure: true,
        // sameSite: "Strict"
    });    //tell the client to delete the token from their cookies
    res.sendStatus(204)
})

app.post('/request-reset', (req, res) => {
    const username = req.body.username
    if (!username || !users.includes(username)) res.sendStatus(401)

    const resetToken = generateResetToken(username)

    //hash and add reset token to database allong with used bool and link to user its for

    const resetPasswordUrl = `https://example.com/reset?token=${resetToken}` //takes the client to the location on the frontend to make reset their password, on reset, the form will be submitted to the /resetpassword endpoint

    ///email resetPasswordUrl to email, should probably switch from username to email in this case

    //frontend needs to extract resetToken from url then send it in the resetpassword request as authorisation header
})

app.put('/reset-password', authenticateToken, (req, res) => { ///need a different authenticateToken as this one uses the accessToken secret, not the reset token secret
    const user = req.body.user
    const newPassword = req.body.password
    const resetToken = req.body.token

    //first select the row where username = user and resetToken = reset token, return bad status code if no ecntry
    //first check token used status, if used then return bad status code ( this is just for if two reset requests come at the same time)
    //   if token not used, set to used

    //since token and user match and token unused, newPassword and change it for the user


})


// login flow
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) =>
// => pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username


// REFRESH TOKEN
// on login user is given refresh token => when access token expires => 
// => user request new access token with refresh token, to revalidate sessions without having to log back in =>
// => when user logs out, refresh token is delete 









// app.get('/links', authenticateToken, (req, res) => {
//     res.json(links)
// })

// db.run to change data
//db.get to get a single row
//db.all to get multiple rows


//get all links
app.get('/links', authenticateToken, (req, res) => {
    // res.json(links)
    db.all('SELECT * FROM links ORDER BY column, row', [], (err, rows) => {
        if (err) throw err
        // console.log(rows)
        res.json(rows)
    })
})
//create a link
app.post('/link', authenticateToken, async (req, res) => {
    const name = req.body.name
    const localIp = req.body.localIp
    const remoteIp = req.body.remoteIp
    const imgUrl = req.body.imgUrl
    const column = req.body.column
    // let rowToInsertAt

    // console.log(rowToInsertAt)

    const getMaxRowInColumn = async () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT MAX(row) AS max_row FROM links WHERE column = ?', [column], (err, row) => {
                if (err) reject(err)
                else resolve(row.max_row)
            })
        })
    }



    const rowToInsertAt = (await getMaxRowInColumn() ?? 0) + 10
    console.log(rowToInsertAt)

    db.run(`INSERT INTO links
        (name, localip, remoteip, imgurl, column, row) VALUES
        (?,?,?,?,?,?)`, [name, localIp, remoteIp, imgUrl, column, rowToInsertAt], (err, rows) => {
        if (err) throw err
        // console.log(rows)
        res.json({ message: `successfully added ${name}` })
    })
})

//delete a link
app.delete('/link/:id', authenticateToken, (req, res) => {
    const id = req.params.id

    db.run('DELETE FROM links WHERE id = ?', [id], (err) => {
        if (err) throw err
    })
    res.json(`${id} deleted`)
})


//update any columns for a link
app.patch('/link/:id', authenticateToken, (req, res) => {
    const id = req.params.id
    const updates = req.body

    // Filter out null or undefined values
    const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== null && value !== undefined)
    );
    const fields = Object.keys(filteredUpdates)
    const values = Object.values(filteredUpdates)

    if (fields.length == 0) {
        return res.status(400).json({ error: 'no fields to update' })
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE links SET ${setClause} WHERE id = ?`;
    db.run(sql, [...values, id], function (err) {
        if (err) return res.status(500).json({ 'error': err.message })
        res.json({ updated: this.changes });
    })
})

//move an id to any position relative to another id and reorder if necesarry, or to an empty column
app.patch('/links/move', authenticateToken, async (req, res) => {
    // console.log('/link/move');
    const idToMove = Number(req.body.idToMove)
    const relativeToId = Number(req.body.relativeToId)
    const position = req.body.position  //'before' or 'after'
    let targetColumn = Number(req.body.targetColumn)

    let rowToInsertAt

    if (relativeToId == (null || undefined || "")) { //if realtiveToId is passed in, then do logic to insert before or after
        rowToInsertAt = 10
    }
    else { //no relative to id so, column must be empty so just insert at first row index on the empty column
        // console.log('gonna try reorder()');
        ({ rowToInsertAt, targetColumn } = await reorder(relativeToId, position))
    }


    console.log(rowToInsertAt)
    db.run('UPDATE links SET row = ?, column = ? WHERE id = ?', [rowToInsertAt, targetColumn, idToMove], (err) => {
        if (err) throw err
        res.json({ message: 'reordered successfully' });
    })
})



let reIndexRowsForColumn = async (column) => {
    let rowNum = 10

    const getRowsToReindex = async (column) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM links WHERE column = ? ORDER by row', [column], (err, rows) => {
                if (err) reject(err)
                else resolve(rows)
            })
        })
    }

    const updateRows = async (id, rowNum) => {
        return new Promise((resolve, reject) => {
            db.run('UPDATE links SET row = ? WHERE id =?', [rowNum, id], (err) => {
                if (err) reject(err)
                else resolve()
            })

        })
    }

    const rowsToReindex = await getRowsToReindex(column)

    for (let i = 0; i < rowsToReindex.length; i++) {
        let id = rowsToReindex[i].id
        await updateRows(id, rowNum)
        rowNum += 10
    }
}

const getOriginalRow = async (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM links WHERE id = ?', [id], (err, row) => {
            if (err) reject(err)
            else {
                let targetColumn = row.column
                let originalRow = row.row
                console.log(`got target column ${targetColumn} and original row ${originalRow}`)
                resolve({ targetColumn: row.column, originalRow: row.row })
            }
        })
    })
}



const getNextRow = async (column, originalRow) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM links where column = ? and row > ? ORDER BY row ASC LIMIT 1', [column, originalRow], (err, row) => {
            if (err) reject(err)
            else {
                // console.log(`got next row ${row.row}`)
                resolve(row?.row ?? originalRow + 20) //if row.row == null, this creates an artificial next row, so row to insert at can still be originalRow + 10 
            }
        })
    })
}

const getPrevRow = async (column, originalRow) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM links where column = ? and row < ? ORDER BY row DESC LIMIT 1', [column, originalRow], (err, row) => {
            if (err) reject(err)
            else {
                // console.log(`got prev row ${row.row ?? 0}`)

                resolve(row?.row ?? 0)  //return the previous row, or the original row if original row is already the first row
            }
        })
    })
}


async function reorderFunctionsToRepeat(relativeToId, position) {


    const { targetColumn, originalRow } = await getOriginalRow(relativeToId)  //return original row and target column


    let secondRow
    let rowToInsertAt

    if (position == 'before') {
        secondRow = await getPrevRow(targetColumn, originalRow) //set second row to row before original row, or to 0 if null or undefined, because that means we're  putting it before the first row
        rowToInsertAt = Math.floor((originalRow + secondRow) / 2)
    }
    else if (position == 'after') {
        secondRow = await getNextRow(targetColumn, originalRow) //set second row to row after original row
        rowToInsertAt = Math.ceil((originalRow + secondRow) / 2)
    }
    // if (secondRow == undefined || secondRow == null) return ({ secondRow: secondRow, originalRow: originalRow, targetColumn: targetColumn, rowToInsertAt: 0 })

    return ({ secondRow: secondRow, originalRow: originalRow, targetColumn: targetColumn, rowToInsertAt: rowToInsertAt })

}

async function reorder(relativeToId, position) {
    let { secondRow, originalRow, targetColumn, rowToInsertAt } = await reorderFunctionsToRepeat(relativeToId, position)


    console.log('original row = ' + originalRow)
    console.log('second row = ' + secondRow)
    console.log('diff = ' + Math.abs(originalRow - secondRow))


    if (Math.abs(originalRow - secondRow) < 2) {  //if gap between two row values is too small to add another value
        await reIndexRowsForColumn(targetColumn)  //then reindex the row values
        console.log('reordered');
        ({ secondRow, originalRow, targetColumn, rowToInsertAt } = await reorderFunctionsToRepeat(relativeToId, position))
    }

    return ({ rowToInsertAt: rowToInsertAt, targetColumn: targetColumn })
}





// login flow 
// authenticate user => make user object using the request.body.username => create a token and sign using user object and secret key

// GET post flow 
// request /posts endpiont -> authenticate token function calls => get token from header => decode token producing error and user object(payload) => 
// =>pass err and payload into callback => send err if persent => if no error create user object in req.user => return posts where username = req.user.username

const port = 4001;

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});