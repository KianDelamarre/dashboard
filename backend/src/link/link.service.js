import db from '../db/db.js'

export async function getLinksService() {

    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM links ORDER BY column, row', (err, rows) => {
            if (err) return reject(err)
            resolve(rows)
        })
    })
}


export async function createLinkService(link) {
    if (!link.name) throw new Error('invalid input')
    try {
        const newRow = await rowToInsertAt(link.column)
        await insertLink(link, newRow)
    }
    catch (err) {
        throw err
    }
}

export async function rowToInsertAt(column) {
    const row = await new Promise((resolve, reject) => {
        db.get('SELECT MAX(row) AS max_row FROM links WHERE column = ?', [column], (err, row) => {
            if (err) return reject(err)
            else resolve(row.max_row)
        })
    })

    //if no rows then return 10, else return row + 10 to insert at 10 after max row
    if (!row) return 10
    return (row + 10)
}

export async function insertLink(link, rowToInsertAt) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT INTO links
            (name, localip, remoteip, imgurl, column, row) VALUES
            (?,?,?,?,?,?)`, [link.name, link.localIp, link.remoteIp, link.imgUrl, link.column, rowToInsertAt], (err, rows) => {
            if (err) reject(err)
            // console.log(rows)
            resolve()
        })
    })
}



export async function deleteLinkService(linkId) {
    if (!linkId) {
        throw new Error('Failed to delete link')
    }

    return await new Promise((resolve, reject) => {
        db.run('DELETE FROM links WHERE id = ?', [linkId], function (err) {
            if (err || this.changes === 0) reject('Failed to delete link')
            resolve()
        });
    })
}


export function updateLinkService(linkId, updates) {
    if (!linkId || !updates) {
        throw new Error('Invalid input');
    }

    // Filter out null or undefined values
    const filteredUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, value]) => value !== null && value !== undefined)
    );

    const fields = Object.keys(filteredUpdates);
    const values = Object.values(filteredUpdates);

    if (fields.length === 0) {
        throw new Error('No fields to update');
    }

    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const sql = `UPDATE links SET ${setClause} WHERE id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [...values, linkId], function (err) {
            if (err) return reject(err);
            resolve(this.changes); // number of rows updated
        });
    });
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