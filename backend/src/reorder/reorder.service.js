import db from '../db/db.js'

let reIndexRowsForColumn = async (column) => {
    let rowNum = 10

    const getRowsToReindex = async (column) => {
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM links WHERE column = ? ORDER [by row', [column], (err, rows) => {
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
            if (!row) return reject(new Error(`Row with id ${id} not found`));
            else {
                // console.log(`got target column ${row.column} and original row ${row.row}`)
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


export async function batchMoveService(moves) {
    if (!moves) {
        throw new Error('invalid input')
    }

    try {
        for (const move of moves) {
            const { idToMove, relativeToId, targetColumn } = move
            if (!idToMove || !targetColumn) throw new Error(`Invalid move: ${JSON.stringify(move)}`);
            console.log(idToMove, relativeToId, targetColumn)
            await moveIdToPositionAndReindex(idToMove, relativeToId, targetColumn)
        }
    }
    catch (err) {
        console.error('Batch move failed:', err);
        throw err;
    }

}

// async function batchDelete(arrayOfIdsToDelete) {
//     for (let i = 0; i < arrayOfIdsToDelete.length; i++) {
//         const id = arrayOfIdsToDelete[i].id
//         db.run('DELETE FROM links WHERE id = ?', [id], (err) => {
//             if (err) throw err
//         })
//     }
// }