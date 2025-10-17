import React from 'react';
import './ExpenseSummary.css';

const ExpenseSummary = ({ expenses, currency = 'INR' }) => {
  const categoryTotals = expenses.reduce((acc, expense) => {
    if (!acc[expense.category]) {
      acc[expense.category] = {
        total: 0,
        color: expense.color,
        icon: expense.icon
      };
    }
    acc[expense.category].total += expense.amount;
    return acc;
  }, {});

  const totalExpenses = Object.values(categoryTotals).reduce((sum, cat) => sum + cat.total, 0);

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

  const getPercentage = (amount) => {
    return totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;
  };

  const currentTip = {
    title: "Save more money this month",
    description: totalExpenses > 0 
      ? `Based on your spending patterns, you could save up to ${formatCurrency(totalExpenses * 0.15)} by reducing your top expense categories by just 15%.`
      : "Start tracking your expenses to get personalized saving tips."
  };

  return (
    <div className="expense-summary">
      <div className="summary-header">
        <h2>Where your money go?</h2>
      </div>

      <div className="category-list">
        {Object.entries(categoryTotals)
          .sort(([,a], [,b]) => b.total - a.total)
          .map(([category, data]) => (
            <div key={category} className="category-item">
              <div className="category-info">
                <div className="category-icon" style={{ backgroundColor: data.color }}>
                  <span>{data.icon}</span>
                </div>
                <span className="category-name">{category}</span>
              </div>
              <div className="category-amount">
                {formatCurrency(data.total)}
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${getPercentage(data.total)}%`,
                    backgroundColor: data.color 
                  }}
                ></div>
              </div>
            </div>
          ))}
      </div>

      <div className="savings-tip">
        <div className="tip-header">
          <div className="tip-icon">
            <span>💡</span>
          </div>
          <div className="tip-badge">
            <span>Smart Tip</span>
          </div>
        </div>
        <div className="tip-content">
          <h3>{currentTip.title}</h3>
          <p>{currentTip.description}</p>
          <div className="tip-stats">
            <div className="tip-stat">
              <span className="stat-value">{Object.keys(categoryTotals).length}</span>
              <span className="stat-label">Categories</span>
            </div>
            <div className="tip-stat">
              <span className="stat-value">{formatCurrency(totalExpenses)}</span>
              <span className="stat-label">Total Spent</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExpenseSummary;
