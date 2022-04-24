"use strict";
const Database = require("better-sqlite3");

const db = new Database('log.db');

// Is the database initialized or do we need to initialize it?
const stmt = db.prepare(`
    SELECT name FROM sqlite_master WHERE type='table' and name='accesslog';`
    );

// Define row using `get()` from better-sqlite3
let row = stmt.get();
// Check if there is a table. If row is undefined then no table exists.
if (row === undefined) {
// Echo information about what you are doing to the console.
    console.log('Your database appears to be empty. I will initialize it now.');
    const sqlInit = `
        CREATE TABLE accesslog ( id INTEGER PRIMARY KEY, 
            remoteaddr TEXT, 
            remoteuser TEXT, 
            time TEXT, 
            method TEXT, 
            url TEXT,  
            protocol TEXT,
            httpversion TEXT,
            secure TEXT, 
            status TEXT, 
            referer TEXT, 
            useragent TEXT);`;
// Execute SQL commands that we just wrote above.
    db.exec(sqlInit);
    console.log("Database is now initalized.");
} else {
    // Since the database already exists, echo that to the console.
    console.log('Database exists.')
}
module.exports = db