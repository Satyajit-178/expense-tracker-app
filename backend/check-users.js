const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'expense_tracker.db');
const db = new sqlite3.Database(dbPath);

// Check users table structure
db.all("PRAGMA table_info(users)", (err, rows) => {
    if (err) {
        console.error('Error:', err);
    } else {
        console.log('Users table structure:');
        console.table(rows);
    }
    
    // Check if profile_picture column exists
    const hasProfilePicture = rows.some(row => row.name === 'profile_picture');
    if (!hasProfilePicture) {
        console.log('Adding profile_picture column...');
        db.run("ALTER TABLE users ADD COLUMN profile_picture TEXT", (err) => {
            if (err) {
                console.error('Error adding profile_picture column:', err);
            } else {
                console.log('profile_picture column added successfully');
            }
            db.close();
        });
    } else {
        console.log('profile_picture column already exists');
        db.close();
    }
});