import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import './Dashboard.css';

const Dashboard = ({ expenses, currency = 'INR', monthlyBudget = 0 }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getIndiaDate = (date = new Date()) => 
    new Date(date.toLocaleString("en-US", {timeZone: "Asia/Kolkata"}));

  // Generate chart data for the last 7 days with proper day labels
  const generateChartData = () => {
    const data = [];
    const today = getIndiaDate();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      const dayExpenses = expenses.filter(expense => expense.date === dateStr);
      const totalAmount = dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);

      // Get day label
      let dayLabel;
      if (i === 0) {
        dayLabel = 'Today';
      } else if (i === 1) {
        dayLabel = 'Yesterday';
      } else {
        dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
      }

      data.push({
        day: dayLabel,
        date: date.getDate(),
        amount: totalAmount,
        isToday: i === 0,
        fullDate: dateStr
      });
    }

    return data;
  };

  const chartData = generateChartData();
  
  const todayStr = getIndiaDate().toISOString().split('T')[0];
  const yesterday = new Date(getIndiaDate());
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const todayExpenses = expenses.filter(expense => expense.date === todayStr);
  const yesterdayExpenses = expenses.filter(expense => expense.date === yesterdayStr);

  const currentMonth = getIndiaDate().getMonth();
  const currentYear = getIndiaDate().getFullYear();
  const monthlyTotal = expenses
    .filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    })
    .reduce((sum, expense) => sum + expense.amount, 0);
  const budgetExceeded = monthlyBudget > 0 && monthlyTotal > monthlyBudget;
  const nearBudgetLimit = monthlyBudget > 0 && monthlyTotal > monthlyBudget * 0.8 && !budgetExceeded;

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

  // Custom tooltip component for the bar chart
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          <p className="tooltip-date">{new Date(dataPoint.fullDate).toLocaleDateString('en-IN', { 
            day: 'numeric', 
            month: 'short' 
          })}</p>
          <p className="tooltip-value">
            <span className="tooltip-color" style={{ backgroundColor: '#8b5cf6' }}></span>
            {`Spent: ${formatCurrency(payload[0].value)}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Expenses</h1>
          <p>{getIndiaDate(currentTime).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
          })} - {getIndiaDate(currentTime).toLocaleTimeString('en-IN', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
          })}</p>
        </div>
      </div>

      {budgetExceeded && (
        <div className="budget-warning budget-exceeded">
          <div className="warning-icon">⚠️</div>
          <div className="warning-content">
            <h3>Budget Exceeded!</h3>
            <p>You've spent {formatCurrency(monthlyTotal)} this month, which exceeds your budget of {formatCurrency(monthlyBudget)} by {formatCurrency(monthlyTotal - monthlyBudget)}.</p>
          </div>
        </div>
      )}

      {nearBudgetLimit && (
        <div className="budget-warning budget-near-limit">
          <div className="warning-icon">💡</div>
          <div className="warning-content">
            <h3>Approaching Budget Limit</h3>
            <p>You've spent {formatCurrency(monthlyTotal)} of your {formatCurrency(monthlyBudget)} monthly budget. You have {formatCurrency(monthlyBudget - monthlyTotal)} remaining.</p>
          </div>
        </div>
      )}

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis
              dataKey="day"
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="amount"
              fill="#8b5cf6"
              radius={[8, 8, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="today-section">
        <h2>Today</h2>
        <div className="expense-items">
          {todayExpenses.length > 0 ? (
            todayExpenses.map((expense) => (
              <div key={expense.id} className="expense-item">
                <div className="expense-icon" style={{ backgroundColor: expense.color }}>
                  <span>{expense.icon}</span>
                </div>
                <div className="expense-details">
                  <h3>{expense.category}</h3>
                  <p>{expense.time} • {expense.description}</p>
                </div>
                <div className="expense-amount">
                  -{formatCurrency(expense.amount)}
                </div>
              </div>
            ))
          ) : (
            <p className="no-expenses">No expenses recorded for today</p>
          )}
        </div>

        {yesterdayExpenses.length > 0 && (
          <div className="yesterday-section">
            <h3>Yesterday</h3>
            <div className="expense-items">
              {yesterdayExpenses.map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-icon" style={{ backgroundColor: expense.color }}>
                    <span>{expense.icon}</span>
                  </div>
                  <div className="expense-details">
                    <h3>{expense.category}</h3>
                    <p>{expense.time} • {expense.description}</p>
                  </div>
                  <div className="expense-amount">
                    -{formatCurrency(expense.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
