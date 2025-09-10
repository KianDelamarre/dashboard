require('dotenv').config()
const sqlite3 = require('sqlite3').verbose();
const express = require('express')
const cors = require('cors')

const app = express()

const links = require('./links.json')
const db = new sqlite3.Database('./database.db')

// console.log(links)

const corsOptions = {
    origin: '*',
    // credentials: true,
}

app.use(express.json(), cors(corsOptions))




// db.run to change data
//db.get to get a single row
//db.all to get multiple rows


//get all links
app.get('/links', (req, res) => {
    // res.json(links)
    db.all('SELECT * FROM links ORDER BY column, row', [], (err, rows) => {
        if (err) throw err
        // console.log(rows)
        res.json(rows)
    })
})
//create a link
app.post('/link', async (req, res) => {
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
app.delete('/link/:id', (req, res) => {
    const id = req.params.id

    db.run('DELETE FROM links WHERE id = ?', [id], (err) => {
        if (err) throw err
    })
    res.json(`${id} deleted`)
})


//update any columns for a link
app.patch('/link/:id', (req, res) => {
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

app.patch('/links/reorder', async (req, res) => {
    const idToMove = Number(req.body.idToMove)
    const relativeToId = Number(req.body.relativeToId)
    const position = req.body.position  //'before' or 'after'

    //if position == before or after
    // res.json({ message: req.body.relativeToId })

    let targetColumn
    let originalRow

    const getOriginalRow = async () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM links WHERE id = ?', [relativeToId], (err, row) => {
                if (err) reject(err)
                else {
                    targetColumn = row.column
                    originalRow = row.row
                    console.log(`got target column ${targetColumn} and original row ${originalRow}`)
                    resolve()
                }
            })
        })
    }

    const getNextRow = async (originalRow) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM links where column = ? and row > ? ORDER BY row DESC LIMIT 1', [targetColumn, originalRow], (err, row) => {
                if (err) reject(err)
                else {
                    console.log(`got next row ${row.row}`)
                    resolve(row.row)
                }
            })
        })
    }

    const getPrevRow = async (originalRow) => {
        return new Promise((resolve, reject) => {
            db.get('SELECT * FROM links where column = ? and row < ? ORDER BY row DESC LIMIT 1', [targetColumn, originalRow], (err, row) => {
                if (err) reject(err)
                else {
                    console.log(`got prev row ${row.row}`)
                    resolve(row.row)
                }
            })
        })
    }

    await getOriginalRow()
    //targetColumn and originalRow now set

    let secondRow
    if (position == 'before') secondRow = await getPrevRow(originalRow)
    else if (position == 'after') secondRow = await getNextRow(originalRow)
    console.log(`got secondRow ${secondRow}`)

    const rowToInsertAt = (originalRow + secondRow) / 2 //get the midpoint between the two rows
    console.log(rowToInsertAt)
    db.run('UPDATE links SET row = ?, column = ? WHERE id = ?', [rowToInsertAt, targetColumn, idToMove], (err) => {
        if (err) throw err
        res.json({ message: 'reordered successfully' });
    })

})



//reorder endpoint to change the row and column values of links in the database, to use with drag and drop reordering

console.log('listening on port 2001')
app.listen(2001, '0.0.0.0', () => console.log('Server running on port 2001'))