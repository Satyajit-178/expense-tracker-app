# Expense Tracker Backend API

A RESTful API for managing personal expenses built with Express.js and SQLite.

## Features

- **Expense Management**: Create, read, update, and delete expenses
- **Category Management**: Organize expenses by categories
- **Statistics**: Get expense summaries and analytics
- **SQLite Database**: Lightweight, file-based database
- **Input Validation**: Comprehensive request validation
- **Error Handling**: Proper error responses and logging

## Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

Or start the production server:
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### Health Check
- `GET /health` - Check if the API is running

### Expenses
- `GET /api/expenses` - Get all expenses
- `GET /api/expenses/:id` - Get expense by ID
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense

### Categories
- `GET /api/categories` - Get all categories
- `GET /api/categories/:id` - Get category by ID
- `POST /api/categories` - Create new category
- `PUT /api/categories/:id` - Update category
- `DELETE /api/categories/:id` - Delete category

### Statistics
- `GET /api/stats` - Get expense statistics and summaries

## Request Examples

### Create Expense
```json
POST /api/expenses
{
  "title": "Lunch at Restaurant",
  "amount": 25.50,
  "category_id": 1,
  "description": "Business lunch meeting",
  "date": "2024-01-15"
}
```

### Create Category
```json
POST /api/categories
{
  "name": "Business Meals",
  "color": "#FF6B6B"
}
```

## Response Format

All API responses follow this format:
```json
{
  "success": true|false,
  "message": "Description of the result",
  "data": {} // Response data (when applicable)
}
```

## Database Schema

### Expenses Table
- `id` - Primary key
- `title` - Expense title
- `amount` - Expense amount
- `category_id` - Foreign key to categories
- `description` - Optional description
- `date` - Expense date
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

### Categories Table
- `id` - Primary key
- `name` - Category name (unique)
- `color` - Hex color code
- `created_at` - Creation timestamp

## Default Categories

The system comes with pre-configured categories:
- Food & Dining
- Transportation
- Shopping
- Entertainment
- Bills & Utilities
- Healthcare
- Education
- Travel
- Other

## Error Handling

The API includes comprehensive error handling:
- Input validation errors (400)
- Not found errors (404)
- Server errors (500)
- Duplicate constraint errors (400)

## Development

The project uses:
- **Express.js** - Web framework
- **SQLite3** - Database
- **express-validator** - Input validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment configuration
