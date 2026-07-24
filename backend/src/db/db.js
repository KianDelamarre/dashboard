import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Convert import.meta.url to a string path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resolve the path to database.db
const dbPath = path.resolve(__dirname, '../../data/database.db')

// Open a single database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message)
    } else {
        // Log both the connection success AND the full path
        console.log('Connected to SQLite database at:', dbPath)
        initializeDatabase()
    }
})

function initializeDatabase() {
    db.serialize(() => {
        db.run(`
            CREATE TABLE IF NOT EXISTS "links" (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                localip TEXT,
                remoteip TEXT,
                imgurl TEXT, 
                name TEXT, 
                "column" INTEGER, 
                row INTEGER DEFAULT 0
            )
        `, (err) => { 
            if (err) {
                console.error('Error creating links table:', err.message); 
            } else {
                console.log('DB initialised. Links table created.');
            }
        })
    })
}

export default db




// import sqlite3 from 'sqlite3'
// import { fileURLToPath } from 'node:url'
// import path from 'node:path'

// // Convert import.meta.url to a string path
// const __filename = fileURLToPath(import.meta.url)
// const __dirname = path.dirname(__filename)

// // Resolve the path to database.db in the same folder as db.js
// const dbPath = path.resolve(__dirname, 'database.db')

// // Open a single database connection
// const db = new sqlite3.Database(dbPath, (err) => {
//     if (err) {
//         console.error('Failed to connect to the database:', err.message)
//     } else {
//         console.log('Connected to SQLite database.')
//     }
// })

// export default db