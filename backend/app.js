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

//move an id to any position relative to another id and reorder if necesarry, or to an empty column
app.patch('/links/move', async (req, res) => {
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

// reIndexRowsForColumn(1)

//reorder endpoint to change the row and column values of links in the database, to use with drag and drop reordering

console.log('listening on port 2001')
app.listen(2001, '0.0.0.0', () => console.log('Server running on port 2001'))