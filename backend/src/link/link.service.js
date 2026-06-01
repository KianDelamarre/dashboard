import db from '../db/db.js'

export async function getLinksService(userId) {
    if (!userId) {
        throw new Error('invalid input')
    }

    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM links WHERE user_id = ? ORDER BY column, row', [userId], (err, rows) => {
            if (err) return reject(err)
            resolve(rows)
        })
    })
}


export async function createLinkService(link) {
    if (!link.name || !link.userId) throw new Error('invalid input')
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
            (name, user_id, localip, remoteip, imgurl, column, row) VALUES
            (?,?,?,?,?,?,?)`, [link.name, link.userId, link.localIp, link.remoteIp, link.imgUrl, link.column, rowToInsertAt], (err, rows) => {
            if (err) reject(err)
            // console.log(rows)
            resolve()
        })
    })
}



export async function deleteLinkService(linkId, userId) {
    if (!userId || !linkId) {
        throw new Error('Failed to delete link')
    }

    return await new Promise((resolve, reject) => {
        db.run('DELETE FROM links WHERE id = ? AND user_id = ?', [linkId, userId], function (err) {
            if (err || this.changes === 0) reject('Failed to delete link')
            resolve()
        });
    })
}


export function updateLinkService(linkId, userId, updates) {
    if (!linkId || !userId || !updates) {
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
    const sql = `UPDATE links SET ${setClause} WHERE id = ? AND user_id = ?`;

    return new Promise((resolve, reject) => {
        db.run(sql, [...values, linkId, userId], function (err) {
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