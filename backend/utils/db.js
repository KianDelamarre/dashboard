const sqlite3 = require('sqlite3').verbose();

// Open a single database connection
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Failed to connect to the database:', err.message);
    } else {
        console.log('Connected to SQLite database.');
    }
});

module.exports = db; // You can export just the db object directly
