const express = require('express');
const cors = require('cors');
const { body, validationResult } = require('express-validator');
const { dbHelpers } = require('./db');
const { authHelpers, authenticateToken } = require('./auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for test-api.html)
app.use(express.static(__dirname));

// Error handling middleware
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};

// Root endpoint - API welcome page
app.get('/', (req, res) => {
    res.json({
        success: true,
        message: 'Welcome to Expense Tracker API',
        version: '1.0.0',
        endpoints: {
            health: '/health',
            expenses: '/api/expenses',
            categories: '/api/categories',
            statistics: '/api/stats',
            testInterface: '/test-api.html'
        },
        documentation: 'See README.md for detailed API documentation'
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        success: true,
        message: 'Expense Tracker API is running',
        timestamp: new Date().toISOString()
    });
});

// AUTH ROUTES

// Register user
app.post('/api/auth/register', [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], handleValidationErrors, (req, res) => {
    authHelpers.register(req.body, (err, user) => {
        if (err) {
            return res.status(400).json({
                success: false,
                message: err.message
            });
        }
        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: user
        });
    });
});

// Login user
app.post('/api/auth/login', [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
], handleValidationErrors, (req, res) => {
    authHelpers.login(req.body.email, req.body.password, (err, result) => {
        if (err) {
            return res.status(401).json({
                success: false,
                message: err.message
            });
        }
        res.json({
            success: true,
            message: 'Login successful',
            data: result
        });
    });
});

// Get current user
app.get('/api/auth/me', authenticateToken, (req, res) => {
    authHelpers.getUserById(req.user.userId, (err, user) => {
        if (err) {
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch user data'
            });
        }
        res.json({
            success: true,
            data: { ...user, profilePicture: user.profile_picture }
        });
    });
});

// EXPENSE ROUTES

// Get all expenses
app.get('/api/expenses', authenticateToken, (req, res) => {
    dbHelpers.getAllExpenses(req.user.userId, (err, expenses) => {
        if (err) {
            console.error('Error fetching expenses:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch expenses'
            });
        }
        res.json({
            success: true,
            data: expenses || []
        });
    });
});

// Get expense by ID
app.get('/api/expenses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    dbHelpers.getExpenseById(id, req.user.userId, (err, expense) => {
        if (err) {
            console.error('Error fetching expense:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch expense'
            });
        }

        if (!expense) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            data: expense
        });
    });
});

// Create new expense
app.post('/api/expenses', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('description').optional().isString()
], handleValidationErrors, (req, res) => {
    const expenseData = {
        user_id: req.user.userId,
        title: req.body.title,
        amount: parseFloat(req.body.amount),
        category_id: parseInt(req.body.category_id),
        description: req.body.description || '',
        date: req.body.date
    };

    dbHelpers.createExpense(expenseData, function (err) {
        if (err) {
            console.error('Error creating expense:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to create expense'
            });
        }

        // Get the created expense
        dbHelpers.getExpenseById(this.lastID, req.user.userId, (err, expense) => {
            if (err) {
                console.error('Error fetching created expense:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Expense created but failed to fetch details'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Expense created successfully',
                data: expense
            });
        });
    });
});

// Update expense
app.put('/api/expenses/:id', authenticateToken, [
    body('title').notEmpty().withMessage('Title is required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be a positive number'),
    body('category_id').isInt({ min: 1 }).withMessage('Valid category ID is required'),
    body('date').isISO8601().withMessage('Valid date is required'),
    body('description').optional().isString()
], handleValidationErrors, (req, res) => {
    const { id } = req.params;
    const expenseData = {
        title: req.body.title,
        amount: parseFloat(req.body.amount),
        category_id: parseInt(req.body.category_id),
        description: req.body.description || '',
        date: req.body.date
    };

    dbHelpers.updateExpense(id, req.user.userId, expenseData, function (err) {
        if (err) {
            console.error('Error updating expense:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to update expense'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        // Get the updated expense
        dbHelpers.getExpenseById(id, req.user.userId, (err, expense) => {
            if (err) {
                console.error('Error fetching updated expense:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Expense updated but failed to fetch details'
                });
            }

            res.json({
                success: true,
                message: 'Expense updated successfully',
                data: expense
            });
        });
    });
});

// Delete expense
app.delete('/api/expenses/:id', authenticateToken, (req, res) => {
    const { id } = req.params;

    dbHelpers.deleteExpense(id, req.user.userId, function (err) {
        if (err) {
            console.error('Error deleting expense:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete expense'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Expense not found'
            });
        }

        res.json({
            success: true,
            message: 'Expense deleted successfully'
        });
    });
});

// CATEGORY ROUTES

// Get all categories
app.get('/api/categories', (req, res) => {
    dbHelpers.getAllCategories((err, categories) => {
        if (err) {
            console.error('Error fetching categories:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch categories'
            });
        }
        res.json({
            success: true,
            data: categories || []
        });
    });
});

// Get category by ID
app.get('/api/categories/:id', (req, res) => {
    const { id } = req.params;

    dbHelpers.getCategoryById(id, (err, category) => {
        if (err) {
            console.error('Error fetching category:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch category'
            });
        }

        if (!category) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            data: category
        });
    });
});

// Create new category
app.post('/api/categories', [
    body('name').notEmpty().withMessage('Category name is required'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color')
], handleValidationErrors, (req, res) => {
    const categoryData = {
        name: req.body.name,
        color: req.body.color || '#3B82F6'
    };

    dbHelpers.createCategory(categoryData, function (err) {
        if (err) {
            console.error('Error creating category:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to create category'
            });
        }

        // Get the created category
        dbHelpers.getCategoryById(this.lastID, (err, category) => {
            if (err) {
                console.error('Error fetching created category:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Category created but failed to fetch details'
                });
            }

            res.status(201).json({
                success: true,
                message: 'Category created successfully',
                data: category
            });
        });
    });
});

// Update category
app.put('/api/categories/:id', [
    body('name').notEmpty().withMessage('Category name is required'),
    body('color').optional().matches(/^#[0-9A-F]{6}$/i).withMessage('Color must be a valid hex color')
], handleValidationErrors, (req, res) => {
    const { id } = req.params;
    const categoryData = {
        name: req.body.name,
        color: req.body.color || '#3B82F6'
    };

    dbHelpers.updateCategory(id, categoryData, function (err) {
        if (err) {
            console.error('Error updating category:', err);
            if (err.message.includes('UNIQUE constraint failed')) {
                return res.status(400).json({
                    success: false,
                    message: 'Category name already exists'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Failed to update category'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        // Get the updated category
        dbHelpers.getCategoryById(id, (err, category) => {
            if (err) {
                console.error('Error fetching updated category:', err);
                return res.status(500).json({
                    success: false,
                    message: 'Category updated but failed to fetch details'
                });
            }

            res.json({
                success: true,
                message: 'Category updated successfully',
                data: category
            });
        });
    });
});

// Delete category
app.delete('/api/categories/:id', (req, res) => {
    const { id } = req.params;

    dbHelpers.deleteCategory(id, function (err) {
        if (err) {
            console.error('Error deleting category:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to delete category'
            });
        }

        if (this.changes === 0) {
            return res.status(404).json({
                success: false,
                message: 'Category not found'
            });
        }

        res.json({
            success: true,
            message: 'Category deleted successfully'
        });
    });
});

// STATISTICS ROUTES

// Get expense statistics
app.get('/api/stats', (req, res) => {
    dbHelpers.getExpenseStats((err, stats) => {
        if (err) {
            console.error('Error fetching statistics:', err);
            return res.status(500).json({
                success: false,
                message: 'Failed to fetch statistics'
            });
        }
        res.json({
            success: true,
            data: stats
        });
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Unhandled error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
    console.log(`API Base URL: http://localhost:${PORT}/api`);
});