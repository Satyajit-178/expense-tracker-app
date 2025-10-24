const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const path = require('path');

// Ensure 'data' directory exists (Render doesn't persist local folders)
const dataDir = path.join(__dirname, 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir);
}

// Create database path
const dbPath = path.join(dataDir, 'expense_tracker.db');

// Create database connection
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('❌ Error opening database:', err.message);
    } else {
        console.log('✅ Connected to the SQLite database.');
        initializeDatabase();
    }
});

// Initialize database tables
function initializeDatabase() {
    // Create categories table
    db.run(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            color TEXT DEFAULT '#3B82F6',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating categories table:', err.message);
        } else {
            console.log('Categories table ready');
            insertDefaultCategories();
        }
    });

    // Create expenses table
    db.run(`
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            title TEXT NOT NULL,
            amount REAL NOT NULL,
            category_id INTEGER,
            description TEXT,
            date DATE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (category_id) REFERENCES categories (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    `, (err) => {
        if (err) {
            console.error('Error creating expenses table:', err.message);
        } else {
            console.log('Expenses table ready');
        }
    });
}

// Insert default categories
function insertDefaultCategories() {
    const defaultCategories = [
        { name: 'Food & Dining', color: '#EF4444' },
        { name: 'Transportation', color: '#F59E0B' },
        { name: 'Shopping', color: '#8B5CF6' },
        { name: 'Entertainment', color: '#EC4899' },
        { name: 'Bills & Utilities', color: '#10B981' },
        { name: 'Healthcare', color: '#06B6D4' },
        { name: 'Education', color: '#6366F1' },
        { name: 'Travel', color: '#84CC16' },
        { name: 'Other', color: '#6B7280' }
    ];

    const checkQuery = 'SELECT COUNT(*) as count FROM categories';
    db.get(checkQuery, (err, row) => {
        if (err) {
            console.error('Error checking categories:', err.message);
            return;
        }

        if (row.count === 0) {
            const insertQuery = 'INSERT INTO categories (name, color) VALUES (?, ?)';
            defaultCategories.forEach(category => {
                db.run(insertQuery, [category.name, category.color], (err) => {
                    if (err) {
                        console.error('Error inserting default category:', err.message);
                    }
                });
            });
            console.log('Default categories inserted');
        }
    });
}

// Database helper functions
const dbHelpers = {
    // Get all expenses with category information for a user
    getAllExpenses: (userId, callback) => {
        const query = `
            SELECT e.*, c.name as category_name, c.color as category_color
            FROM expenses e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.user_id = ?
            ORDER BY e.date DESC, e.created_at DESC
        `;
        db.all(query, [userId], callback);
    },

    // Get expense by ID for a user
    getExpenseById: (id, userId, callback) => {
        const query = `
            SELECT e.*, c.name as category_name, c.color as category_color
            FROM expenses e
            LEFT JOIN categories c ON e.category_id = c.id
            WHERE e.id = ? AND e.user_id = ?
        `;
        db.get(query, [id, userId], callback);
    },

    // Create new expense
    createExpense: (expense, callback) => {
        const query = `
            INSERT INTO expenses (user_id, title, amount, category_id, description, date)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        db.run(query, [
            expense.user_id,
            expense.title,
            expense.amount,
            expense.category_id,
            expense.description,
            expense.date
        ], callback);
    },

    // Update expense
    updateExpense: (id, userId, expense, callback) => {
        const query = `
            UPDATE expenses 
            SET title = ?, amount = ?, category_id = ?, description = ?, date = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        `;
        db.run(query, [
            expense.title,
            expense.amount,
            expense.category_id,
            expense.description,
            expense.date,
            id,
            userId
        ], callback);
    },

    // Delete expense
    deleteExpense: (id, userId, callback) => {
        const query = 'DELETE FROM expenses WHERE id = ? AND user_id = ?';
        db.run(query, [id, userId], callback);
    },

    // Get all categories
    getAllCategories: (callback) => {
        const query = 'SELECT * FROM categories ORDER BY name';
        db.all(query, callback);
    },

    // Get category by ID
    getCategoryById: (id, callback) => {
        const query = 'SELECT * FROM categories WHERE id = ?';
        db.get(query, [id], callback);
    },

    // Create new category
    createCategory: (category, callback) => {
        const query = 'INSERT INTO categories (name, color) VALUES (?, ?)';
        db.run(query, [category.name, category.color], callback);
    },

    // Update category
    updateCategory: (id, category, callback) => {
        const query = 'UPDATE categories SET name = ?, color = ? WHERE id = ?';
        db.run(query, [category.name, category.color, id], callback);
    },

    // Delete category
    deleteCategory: (id, callback) => {
        const query = 'DELETE FROM categories WHERE id = ?';
        db.run(query, [id], callback);
    },

    // Get expense statistics
    getExpenseStats: (callback) => {
        const queries = {
            total: 'SELECT SUM(amount) as total FROM expenses',
            count: 'SELECT COUNT(*) as count FROM expenses',
            byCategory: `
                SELECT c.name, c.color, SUM(e.amount) as total, COUNT(e.id) as count
                FROM expenses e
                JOIN categories c ON e.category_id = c.id
                GROUP BY c.id, c.name, c.color
                ORDER BY total DESC
            `,
            recent: `
                SELECT e.*, c.name as category_name, c.color as category_color
                FROM expenses e
                LEFT JOIN categories c ON e.category_id = c.id
                ORDER BY e.created_at DESC
                LIMIT 5
            `
        };

        const stats = {};
        let completed = 0;
        const total = Object.keys(queries).length;

        Object.entries(queries).forEach(([key, query]) => {
            if (key === 'total' || key === 'count') {
                db.get(query, (err, row) => {
                    if (!err) stats[key] = row;
                    completed++;
                    if (completed === total) callback(null, stats);
                });
            } else {
                db.all(query, (err, rows) => {
                    if (!err) stats[key] = rows;
                    completed++;
                    if (completed === total) callback(null, stats);
                });
            }
        });
    }
};

// Close database connection gracefully
process.on('SIGINT', () => {
    db.close((err) => {
        if (err) {
            console.error('Error closing database:', err.message);
        } else {
            console.log('Database connection closed');
        }
        process.exit(0);
    });
});

module.exports = { db, dbHelpers };