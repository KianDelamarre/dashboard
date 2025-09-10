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

    const getMaxRow = async () => {
        return new Promise((resolve, reject) => {
            db.get('SELECT MAX(row) AS max_row FROM links WHERE column = ?', [column], (err, row) => {
                if (err) reject(err)
                else resolve(row.max_row)
            })
        })
    }

    const rowToInsertAt = (await getMaxRow() ?? 0) + 10
    // console.log(rowToInsertAt)

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

app.patch('/link/reorder', (req, res) => {
    const refId = req.body.refId
    const relativeToId = req.body.relativeToId
    const targetColumn = req.body.targetColumn
    const position = req.body.position

    //if position == before or after

    db.run(' ')
})

//reorder endpoint to change the row and column values of links in the database, to use with drag and drop reordering

console.log('listening on port 2001')
app.listen(2001, '127.0.0.1', () => console.log('Server running on port 2001'))