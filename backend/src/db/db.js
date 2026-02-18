import sqlite3 from 'sqlite3'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// Convert import.meta.url to a string path
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Resolve the path to database.db in the same folder as db.js
const dbPath = path.resolve(__dirname, 'database.db')

// Open a single database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message)
    } else {
        console.log('Connected to SQLite database.')
    }
})

export default db