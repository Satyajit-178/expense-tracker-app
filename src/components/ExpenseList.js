import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3 } from 'lucide-react';
import './ExpenseList.css';

const ExpenseList = ({ expenses, onAddExpense, onDeleteExpense, onEditExpense, currency = 'INR', monthlyBudget = 0, setMonthlyBudget }) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showBudgetForm, setShowBudgetForm] = useState(false);
  const [budgetInput, setBudgetInput] = useState(monthlyBudget.toString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  const [newExpense, setNewExpense] = useState({
    category: '',
    amount: '',
    description: '',
    icon: '💰',
    color: '#3b82f6'
  });

  const categories = [
    { name: 'Food & Dining', icon: '🍽️', color: '#ef4444' },
    { name: 'Transportation', icon: '🚌', color: '#f59e0b' },
    { name: 'Shopping', icon: '🛍️', color: '#8b5cf6' },
    { name: 'Education', icon: '📚', color: '#6366f1' },
    { name: 'Travel', icon: '✈️', color: '#84cc16' },
    { name: 'Other', icon: '💰', color: '#6b7280' },
    { name: 'Healthcare', icon: '🏥', color: '#06b6d4' },
    { name: 'Entertainment', icon: '🎬', color: '#ec4899' },
    { name: 'Bills & Utilities', icon: '🏠', color: '#10b981' }
  ];

  const getCurrencySymbol = (currencyCode) => {
    const symbols = {
      'INR': '₹',
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'IDR': 'Rp',
      'JPY': '¥'
    };
    return symbols[currencyCode] || currencyCode;
  };

  const formatCurrency = (amount) => {
    const symbol = getCurrencySymbol(currency);
    return `${symbol}${amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newExpense.category && newExpense.amount) {
      const selectedCategory = categories.find(cat => cat.name === newExpense.category);
      
      if (editingExpense) {
        // Edit existing expense
        onEditExpense({
          ...editingExpense,
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          icon: selectedCategory?.icon || editingExpense.icon,
          color: selectedCategory?.color || editingExpense.color
        });
        setEditingExpense(null);
      } else {
        // Add new expense
        onAddExpense({
          ...newExpense,
          amount: parseFloat(newExpense.amount),
          icon: selectedCategory?.icon || '💰',
          color: selectedCategory?.color || '#3b82f6'
        });
      }
      
      setNewExpense({
        category: '',
        amount: '',
        description: '',
        icon: '💰',
        color: '#3b82f6'
      });
      setShowAddForm(false);
    }
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setNewExpense({
      category: expense.category,
      amount: expense.amount.toString(),
      description: expense.description || ''
    });
    setShowAddForm(true);
  };

  const handleCancelEdit = () => {
    setEditingExpense(null);
    setNewExpense({
      category: '',
      amount: '',
      description: '',
      icon: '💰',
      color: '#3b82f6'
    });
    setShowAddForm(false);
  };

  const handleCategoryChange = (categoryName) => {
    const selectedCategory = categories.find(cat => cat.name === categoryName);
    setNewExpense({
      ...newExpense,
      category: categoryName,
      icon: selectedCategory?.icon || '💰',
      color: selectedCategory?.color || '#3b82f6'
    });
  };

  const handleBudgetSubmit = (e) => {
    e.preventDefault();
    const budget = parseFloat(budgetInput);
    if (!isNaN(budget) && budget >= 0) {
      setMonthlyBudget(budget);
      setShowBudgetForm(false);
    }
  };

  const handleBudgetCancel = () => {
    setBudgetInput(monthlyBudget.toString());
    setShowBudgetForm(false);
  };

  const groupedExpenses = expenses.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(expense);
    return acc;
  }, {});

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    // Get current time in India timezone
    const indiaTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));
    const today = new Date(indiaTime);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today - ${indiaTime.toLocaleTimeString('en-IN', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: true 
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-IN', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
  };

  return (
    <div className="expense-list">
      <div className="expense-list-header">
        <h1>Expenses</h1>
        <div className="header-actions">
          <button 
            className="budget-btn"
            onClick={() => setShowBudgetForm(true)}
          >
            💰 Budget: {formatCurrency(monthlyBudget)}
          </button>
          <button 
            className="add-expense-btn"
            onClick={() => setShowAddForm(true)}
          >
            <Plus size={20} />
            Add Expense
          </button>
        </div>
      </div>

      {showBudgetForm && (
        <div className="budget-form">
          <h3>Set Monthly Budget</h3>
          <form onSubmit={handleBudgetSubmit}>
            <div className="form-group">
              <label>Monthly Budget Amount</label>
              <input
                type="number"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleBudgetSubmit(e)}
                placeholder="Enter budget amount"
                min="0"
                step="0.01"
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Budget</button>
              <button type="button" className="cancel-btn" onClick={handleBudgetCancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showAddForm && (
        <div className="add-expense-form">
          <h3>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Category</label>
              <select
                value={newExpense.category}
                onChange={(e) => handleCategoryChange(e.target.value)}
                required
              >
                <option value="">Select a category</option>
                {categories.map(category => (
                  <option key={category.name} value={category.name}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Amount</label>
              <input
                type="number"
                step="0.001"
                value={newExpense.amount}
                onChange={(e) => setNewExpense({...newExpense, amount: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="0.000"
                required
              />
            </div>
            <div className="form-group">
              <label>Description (Optional)</label>
              <input
                type="text"
                value={newExpense.description}
                onChange={(e) => setNewExpense({...newExpense, description: e.target.value})}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                placeholder="Enter description (optional)"
              />
            </div>
            <div className="form-actions">
              <button type="button" onClick={editingExpense ? handleCancelEdit : () => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
              <button type="submit" className="submit-btn">
                {editingExpense ? 'Update Expense' : 'Add Expense'}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="expenses-container">
        {expenses.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <span>💸</span>
            </div>
            <div className="empty-state-content">
              <h3>No Expenses Yet</h3>
              <p>Start tracking your expenses by clicking the "Add Expense" button above.</p>
              <p className="empty-state-tip">💡 Tip: Set a monthly budget to better manage your spending!</p>
            </div>
          </div>
        ) : (
          Object.entries(groupedExpenses)
            .sort(([a], [b]) => new Date(b) - new Date(a))
            .map(([date, dayExpenses]) => (
              <div key={date} className="expense-group">
                <h3 className="date-header">{formatDate(date)}</h3>
                <div className="expense-items">
                  {dayExpenses.map((expense) => (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-icon" style={{ backgroundColor: expense.color }}>
                        <span>{expense.icon}</span>
                      </div>
                      <div className="expense-details">
                        <h4>{expense.category}</h4>
                        <p>{expense.description}</p>
                      </div>
                      <div className="expense-amount">
                        -{formatCurrency(expense.amount)}
                      </div>
                      <div className="expense-actions">
                        <button 
                          className="action-btn edit-btn"
                          onClick={() => handleEdit(expense)}
                        >
                          <Edit3 size={16} />
                        </button>
                        <button 
                          className="action-btn delete-btn"
                          onClick={() => onDeleteExpense(expense.id)}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ExpenseList;
