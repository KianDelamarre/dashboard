const fs = require('fs')
const db = require('./db.js');

function getLinks(req, res) {
    db.all('SELECT * FROM links ORDER BY column, row', [], (err, rows) => {
        if (err) throw err
        res.json(rows)
    })
}
async function createLink(req, res) {
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
}

function deleteLink(req, res) {
    const id = req.params.id;

    db.run('DELETE FROM links WHERE id = ?', [id], function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to delete link' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Link not found' });
        }
        res.json({ message: `${id} deleted` });
    });
}

function updateLink(req, res) {
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
}

function writeDataToFile(filename, content) {
    fs.writeFileSync(filename, JSON.stringify(content), 'utf8', (err) => {
        if (err) {
            console.log(err);
        }
    })
}

// function getNoteData(req) {
//     return new Promise((resolve, reject) => {
//         try {
//             let body = "";
//             req.on('data', (chunk) => {
//                 body += chunk.toString()
//             })

//             req.on('end', () => {
//                 resolve(body)
//             }
//             )
//         }

//         catch (error) {
//             reject(err)


//         }
//     })
// }

module.exports = {
    writeDataToFile, getLinks, createLink, updateLink, deleteLink
}