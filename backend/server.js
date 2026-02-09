require('dotenv').config()

const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose();

const { authenticateToken, generateAccessToken, generateResetToken, authenticateUser } = require('./utils/auth.js')

const app = express()

const cookieParser = require('cookie-parser')

const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')

const links = require('./links.json')
const db = new sqlite3.Database('./database.db')

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


app.use(express.json(), cors(corsOptions), cookieParser())

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
        ...cookieOptions,
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
        ...cookieOptions
    });    //tell the client to delete the token from their cookies
    res.sendStatus(204)
})

// app.post('/request-reset', (req, res) => {
//     const username = req.body.username
//     if (!username || !users.includes(username)) res.sendStatus(401)

//     const resetToken = generateResetToken(username)

//     //hash and add reset token to database allong with used bool and link to user its for

//     const resetPasswordUrl = `https://kianserver.uk/reset?token=${resetToken}` //takes the client to the location on the frontend to make reset their password, on reset, the form will be submitted to the /resetpassword endpoint

//     ///email resetPasswordUrl to email, should probably switch from username to email in this case

//     //frontend needs to extract resetToken from url then send it in the resetpassword request as authorisation header
// })

// app.put('/reset-password', authenticateToken, (req, res) => { ///need a different authenticateToken as this one uses the accessToken secret, not the reset token secret
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

//get all links
app.get('/links', authenticateToken, (req, res) => {
    // res.json(links)
    db.all('SELECT * FROM links ORDER BY column, row', [], (err, rows) => {
        if (err) throw err
        // console.log(rows)
        res.json(rows)
    })
})

app.get('/links/status', (req, res) => {

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
    const idToMove = Number(req.body.idToMove)
    const relativeToId = Number(req.body.relativeToId)
    let targetColumn = Number(req.body.targetColumn)
    console.log(idToMove, relativeToId, targetColumn);

    await moveIdToPositionAndReindex(idToMove, relativeToId, targetColumn);
    res.status(200).json({ "message": `${idToMove} succesfully moved` })
})


app.patch('/links/batchmove', authenticateToken, async (req, res) => {
    arrayOfidToMovesRelativeToIdsandTargetColumns = req.body

    await batchInsert(req.body)
    res.sendStatus(200)
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

const getRowAndColumnForId = async (id) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM links WHERE id = ?', [id], (err, row) => {
            if (err) reject(err)
            else {
                // let targetColumn = row.column
                // let originalRow = row.row
                console.log(`got target column ${row.column} and original row ${row.row}`)
                resolve({ targetColumn: row.column, relativeToIdRow: row.row })
            }
        })
    })
}

const getPrevRow = async (column, originalRow) => { //get the row of the id before relativeToId in order to later calcate halfway between the two
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

const getLastRowInColumn = async (column) => {
    return new Promise((resolve, reject) => {
        db.get('SELECT * FROM links WHERE column = ? ORDER BY row DESC LIMIT 1', [column], (err, row) => {
            if (err) reject(err)
            else resolve(row?.row ?? 0)
        })
    })
}

const moveIdToPosition = async (idToMove, rowToInsertAt, FinaltargetColumn) => {
    return new Promise((resolve, reject) => {
        db.run('UPDATE links SET row = ?, column = ? WHERE id = ?', [rowToInsertAt, FinaltargetColumn, idToMove], (err) => {
            if (err) reject(err)
            resolve(`${idToMove} moved to ${rowToInsertAt}`)
        })
    })
}

async function moveIdToPositionAndReindex(idToMove, relativeToId, targetColumn) {

    let rowToInsertAt
    if (!relativeToId) { //if no relative to id, then we're placing either at the end of a row, or at the start of a new row
        //calucalte target Columns length and largest row number
        const lastRowNumber = await getLastRowInColumn(targetColumn)
        rowToInsertAt = lastRowNumber + 10  //can insert at end of row, or start of new row, as when at start of new row, lastRowNumber = 0, so will insert at row 10
        console.log('row to insert at is ' + rowToInsertAt)
        return await moveIdToPosition(idToMove, rowToInsertAt, targetColumn)
        //({ rowToInsertAt: rowToInsertAt, targetColumn: targetColumn })
    }
    // console.log('row to insert at is ' + rowToInsertAt)


    let relativeToIdRow
    ({ targetColumn, relativeToIdRow } = await getRowAndColumnForId(relativeToId))  //return original row and target column

    let prevRow = await getPrevRow(targetColumn, relativeToIdRow) //set second row to row before original row, or to 0 if null or undefined, because that means we're  putting it before the first row

    if (Math.abs(relativeToIdRow - prevRow) < 2) {  //if gap between two row values is too small to add another value
        await reIndexRowsForColumn(targetColumn)  //then reindex the row values
        console.log('reordered');
        return await moveIdToPositionAndReindex(idToMove, relativeToId, targetColumn)
    }
    rowToInsertAt = Math.floor((relativeToIdRow + prevRow) / 2)

    console.log("relative to id row = " + relativeToIdRow)
    console.log("prev row is =" + prevRow)
    console.log('row to insert at is ' + rowToInsertAt)
    // console.log(idToMove, rowToInsertAt, targetColumn)
    return await moveIdToPosition(idToMove, rowToInsertAt, targetColumn)
    // return ({ rowToInsertAt: rowToInsertAt, FinaltargetColumn: targetColumn })
}


async function batchInsert(arrayOfidToMovesRelativeToIdsandTargetColumns) {
    // [{relativeToId : ?, FinaltargetColumn: ?}, {relativeToId : ?, FinaltargetColumn: ?}]
    const arrayLength = arrayOfidToMovesRelativeToIdsandTargetColumns.length

    for (let i = 0; i < arrayLength; i++) {
        let idToMove = arrayOfidToMovesRelativeToIdsandTargetColumns[i].idToMove
        let relativeToId = arrayOfidToMovesRelativeToIdsandTargetColumns[i].relativeToId
        let targetColumn = arrayOfidToMovesRelativeToIdsandTargetColumns[i].targetColumn
        console.log(idToMove, relativeToId, targetColumn)
        await moveIdToPositionAndReindex(idToMove, relativeToId, targetColumn)
    }

    return
}

async function batchDelete(arrayOfIdsToDelete) {
    for (let i = 0; i < arrayOfIdsToDelete.length; i++) {
        const id = arrayOfIdsToDelete[i].id
        db.run('DELETE FROM links WHERE id = ?', [id], (err) => {
            if (err) throw err
        })
    }
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