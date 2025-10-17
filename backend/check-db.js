const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'expense_tracker.db');
const db = new sqlite3.Database(dbPath);

// Check expenses table structure
db.all("PRAGMA table_info(expenses)", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Expenses table structure:');
        console.table(rows);
    }
    
    // Check if user_id column exists
    const hasUserId = rows.some(row => row.name === 'user_id');
    if (!hasUserId) {
        console.log('Adding user_id column...');
        db.run("ALTER TABLE expenses ADD COLUMN user_id INTEGER", (err) => {
            if (err) {
                console.error('Error adding user_id column:', err);
            } else {
                console.log('user_id column added successfully');
            }
            db.close();
        });
    } else {
        console.log('user_id column already exists');
        db.close();
    }
});