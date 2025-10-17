const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { db } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const SALT_ROUNDS = 10;

// Initialize users table
function initializeUsersTable() {
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            profile_picture TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `, (err) => {
        if (err) {
            console.error('Error creating users table:', err.message);
        } else {
            console.log('Users table ready');
        }
    });
}

// Call this when the module is loaded
initializeUsersTable();

const authHelpers = {
    // Register new user
    register: async (userData, callback) => {
        try {
            const hashedPassword = await bcrypt.hash(userData.password, SALT_ROUNDS);
            const seeds = ['Alice', 'Bob', 'Charlie', 'Diana', 'Eve', 'Frank', 'Grace', 'Henry', 'Ivy', 'Jack'];
            const bgs = ['b6e3f4', 'fecaca', 'd8b4fe', 'fed7aa', 'bfdbfe', 'fde68a', 'a7f3d0', 'fb7185', 'fdba74', 'c4b5fd'];
            const randomSeed = seeds[Math.floor(Math.random() * seeds.length)];
            const randomBg = bgs[Math.floor(Math.random() * bgs.length)];
            const profilePicture = `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}&backgroundColor=${randomBg}`;
            
            const query = 'INSERT INTO users (name, email, password, profile_picture) VALUES (?, ?, ?, ?)';
            
            db.run(query, [userData.name, userData.email, hashedPassword, profilePicture], function(err) {
                if (err) {
                    if (err.message.includes('UNIQUE constraint failed')) {
                        return callback(new Error('Email already exists'));
                    }
                    return callback(err);
                }
                
                // Get the created user
                db.get('SELECT id, name, email, profile_picture FROM users WHERE id = ?', [this.lastID], (err, user) => {
                    if (err) return callback(err);
                    callback(null, user);
                });
            });
        } catch (error) {
            callback(error);
        }
    },

    // Login user
    login: async (email, password, callback) => {
        try {
            db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
                if (err) return callback(err);
                if (!user) return callback(new Error('Invalid credentials'));

                const isValidPassword = await bcrypt.compare(password, user.password);
                if (!isValidPassword) return callback(new Error('Invalid credentials'));

                const token = jwt.sign(
                    { userId: user.id, email: user.email },
                    JWT_SECRET,
                    { expiresIn: '7d' }
                );

                callback(null, {
                    token,
                    user: { id: user.id, name: user.name, email: user.email, profilePicture: user.profile_picture }
                });
            });
        } catch (error) {
            callback(error);
        }
    },

    // Verify JWT token
    verifyToken: (token) => {
        try {
            return jwt.verify(token, JWT_SECRET);
        } catch (error) {
            return null;
        }
    },

    // Get user by ID
    getUserById: (id, callback) => {
        db.get('SELECT id, name, email, profile_picture FROM users WHERE id = ?', [id], callback);
    }
};

// Middleware to authenticate requests
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Access token required'
        });
    }

    const decoded = authHelpers.verifyToken(token);
    if (!decoded) {
        return res.status(403).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }

    req.user = decoded;
    next();
};

module.exports = { authHelpers, authenticateToken };