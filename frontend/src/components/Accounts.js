import React, { useState } from 'react';
import { User, Mail, LogOut, LogIn, Edit3, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import './Accounts.css';

const Accounts = ({ expenses = [], currency = 'INR', userProfile, setUserProfile }) => {
  const { logout } = useAuth();
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState('');
  const [userInfo, setUserInfo] = useState(userProfile);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    logout();
  };

  const handleProfilePictureChange = () => {
    const seeds = ['Samantha', 'Sarah', 'Emma', 'Olivia', 'Ava'];
    const bgs = ['b6e3f4,c0aede,d1d4f9', 'fecaca,fde68a,a7f3d0', 'd8b4fe,fbbf24,fb7185'];
    const seed = seeds[Math.floor(Math.random() * seeds.length)];
    const bg = bgs[Math.floor(Math.random() * bgs.length)];
    const newAvatar = `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=${bg}`;
    const updatedInfo = { ...userInfo, profilePicture: newAvatar };
    setUserInfo(updatedInfo);
    setUserProfile({ ...updatedInfo, profilePicture: newAvatar });
  };

  const handleEditStart = (field) => {
    setEditingField(field);
    setTempValue(userInfo[field]);
  };

  const handleEditSave = () => {
    if (tempValue.trim()) {
      const updatedInfo = { ...userInfo, [editingField]: tempValue.trim() };
      setUserInfo(updatedInfo);
      setUserProfile(updatedInfo);
    }
    setEditingField(null);
    setTempValue('');
  };

  const handleEditCancel = () => {
    setEditingField(null);
    setTempValue('');
  };

  // Currency formatting function
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

  // Calculate statistics from actual expense data
  const calculateStats = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    // Calculate total expenses for current month
    const currentMonthExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });
    
    const totalExpenses = currentMonthExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate unique categories used (from all expenses, not just current month)
    const categoriesUsed = [...new Set(expenses.map(expense => expense.category))].length;
    const transactionsThisMonth = currentMonthExpenses.length;
    const averageExpense = transactionsThisMonth > 0 ? totalExpenses / transactionsThisMonth : 0;
    
    return {
      totalExpenses,
      categoriesUsed,
      transactionsThisMonth
    };
  };

  const stats = calculateStats();

  if (!isLoggedIn) {
    return (
      <div className="accounts">
        <div className="login-container">
          <div className="login-card">
            <div className="login-icon">
              <LogIn size={48} />
            </div>
            <h2>Welcome Back!</h2>
            <p>Please log in to access your account</p>
            <button className="login-btn" onClick={handleLogin}>
              <LogIn size={20} />
              Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="accounts">
      <div className="accounts-header">
        <h1>Account</h1>
        <p>Manage your profile and account settings</p>
      </div>

      <div className="accounts-content">
        {/* Profile Section */}
        <div className="account-section">
          <h2>Profile Information</h2>
          <div className="profile-card">
            <div className="profile-picture-container">
              <img 
                src={userInfo.profilePicture} 
                alt="Profile" 
                className="profile-picture"
              />
              <button 
                className="change-picture-btn"
                onClick={handleProfilePictureChange}
                title="Change profile picture"
              >
                <Camera size={16} />
              </button>
            </div>
            <div className="profile-info">
              <div className="info-item">
                <div className="info-icon">
                  <User size={20} />
                </div>
                <div className="info-content">
                  <label>Full Name</label>
                  {editingField === 'name' ? (
                    <div className="edit-input-container">
                      <input
                        type="text"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={handleEditSave} className="save-btn">Save</button>
                        <button onClick={handleEditCancel} className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p>{userInfo.name}</p>
                  )}
                </div>
                {editingField !== 'name' && (
                  <button className="edit-btn" onClick={() => handleEditStart('name')}>
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
              <div className="info-item">
                <div className="info-icon">
                  <Mail size={20} />
                </div>
                <div className="info-content">
                  <label>Email Address</label>
                  {editingField === 'email' ? (
                    <div className="edit-input-container">
                      <input
                        type="email"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleEditSave()}
                        className="edit-input"
                        autoFocus
                      />
                      <div className="edit-actions">
                        <button onClick={handleEditSave} className="save-btn">Save</button>
                        <button onClick={handleEditCancel} className="cancel-btn">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <p>{userInfo.email}</p>
                  )}
                </div>
                {editingField !== 'email' && (
                  <button className="edit-btn" onClick={() => handleEditStart('email')}>
                    <Edit3 size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Account Stats */}
        <div className="account-section">
          <h2>Account Statistics</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Expenses</h3>
              <p className="stat-number">{formatCurrency(stats.totalExpenses)}</p>
              <span className="stat-label">This month</span>
            </div>
            <div className="stat-card">
              <h3>Categories Used</h3>
              <p className="stat-number">{stats.categoriesUsed}</p>
              <span className="stat-label">Active categories</span>
            </div>
            <div className="stat-card">
              <h3>Transactions</h3>
              <p className="stat-number">{stats.transactionsThisMonth}</p>
              <span className="stat-label">This month</span>
            </div>
          </div>
        </div>

        {/* Account Actions */}
        <div className="account-section">
          <h2>Account Actions</h2>
          <div className="actions-card">
            <button className="action-item logout-btn" onClick={handleLogout}>
              <div className="action-icon">
                <LogOut size={20} />
              </div>
              <div className="action-content">
                <h3>Sign Out</h3>
                <p>Sign out of your account</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Accounts;
