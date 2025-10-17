# Expense Tracker

A modern, responsive expense tracking application built with React. Track your daily expenses with beautiful charts and categorized breakdowns.

## Features

- 📊 **Interactive Dashboard** - View expense trends with beautiful bar charts
- 📝 **Expense Management** - Add, edit, and delete expenses easily
- 📱 **Category Breakdown** - See where your money goes with visual progress bars
- 🎨 **Modern UI** - Clean, minimal design with a professional color palette
- 📱 **Responsive Design** - Works perfectly on desktop and mobile devices
- 💡 **Smart Tips** - Get suggestions to save more money

## Components

- **Sidebar** - Navigation menu with user profile
- **Dashboard** - Main view with expense chart and recent transactions
- **ExpenseList** - Manage all expenses with add/edit/delete functionality
- **ExpenseSummary** - Category-wise expense breakdown with progress bars

## Tech Stack

- **React 18** - Modern React with hooks
- **Recharts** - Beautiful, responsive charts
- **Lucide React** - Clean, consistent icons
- **CSS3** - Custom styling with modern CSS features

## Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository or navigate to the project directory
2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Open [http://localhost:3000](http://localhost:3000) to view it in the browser

### Available Scripts

- `npm start` - Runs the app in development mode
- `npm build` - Builds the app for production
- `npm test` - Launches the test runner
- `npm eject` - Ejects from Create React App (one-way operation)

## Usage

1. **Dashboard View**: See your expense overview with charts and recent transactions
2. **Add Expenses**: Click "Add Expense" to record new expenses with categories
3. **Manage Expenses**: Navigate to the Expenses tab to view, edit, or delete expenses
4. **Category Insights**: View the expense summary to understand spending patterns

## Color Palette

The app uses a minimal, professional color palette:
- **Primary Blue**: #3b82f6
- **Secondary Purple**: #8b5cf6
- **Orange**: #f97316
- **Red**: #ef4444
- **Green**: #22c55e
- **Dark Gray**: #1e293b
- **Light Gray**: #64748b

## Project Structure

```
src/
├── components/
│   ├── Sidebar.js          # Navigation sidebar
│   ├── Dashboard.js        # Main dashboard with charts
│   ├── ExpenseList.js      # Expense management
│   ├── ExpenseSummary.js   # Category breakdown
│   └── *.css              # Component styles
├── App.js                 # Main app component
├── App.css               # Global app styles
├── index.js              # React entry point
└── index.css             # Global styles
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is open source and available under the [MIT License](LICENSE).
