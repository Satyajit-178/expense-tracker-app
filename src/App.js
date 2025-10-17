import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import ExpenseList from './components/ExpenseList';
import ExpenseSummary from './components/ExpenseSummary';
import Settings from './components/Settings';
import Accounts from './components/Accounts';
import Login from './components/Login';
import './App.css';

function AppContent() {
    const { user, loading, token, logout } = useAuth();

    if (loading) {
        return (
            <div className="loading-container">
                <div className="loading-spinner">Loading...</div>
            </div>
        );
    }

    if (!user || !token) {
        return <Login />;
    }
    const [activeTab, setActiveTab] = useState('Dashboard');
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [darkMode, setDarkMode] = useState(() => {
        const saved = localStorage.getItem('darkMode');
        return saved ? JSON.parse(saved) : false; // Default to light mode
    });
    const [currency, setCurrency] = useState(() => {
        return localStorage.getItem('currency') || 'INR';
    });
    const [monthlyBudget, setMonthlyBudget] = useState(() => {
        const saved = localStorage.getItem('monthlyBudget');
        return saved ? parseFloat(saved) : 0;
    });
    const [userProfile, setUserProfile] = useState(user || {
        name: 'User',
        email: 'user@email.com',
        profilePicture: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User&backgroundColor=b6e3f4'
    });

    useEffect(() => {
        if (user) {
            setUserProfile(user);
        }
    }, [user]);
    const [fontSize, setFontSize] = useState(() => {
        return localStorage.getItem('fontSize') || 'medium';
    });
    const [colorTheme, setColorTheme] = useState(() => {
        return localStorage.getItem('colorTheme') || 'default';
    });
    const [expenses, setExpenses] = useState([]);
    const API_BASE_URL = 'http://localhost:4000/api';

    // Load expenses when token is available
    useEffect(() => {
        if (token) {
            fetchExpenses();
        }
    }, [token]);

    // Dark mode effect
    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.setAttribute('data-theme', 'dark');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
    }, [darkMode]);

    // Currency effect
    useEffect(() => {
        localStorage.setItem('currency', currency);
    }, [currency]);

    // Budget effect
    useEffect(() => {
        localStorage.setItem('monthlyBudget', monthlyBudget.toString());
    }, [monthlyBudget]);

    // User profile effect
    useEffect(() => {
        localStorage.setItem('userProfile', JSON.stringify(userProfile));
    }, [userProfile]);

    // Font size effect
    useEffect(() => {
        localStorage.setItem('fontSize', fontSize);
        document.documentElement.setAttribute('data-font-size', fontSize);
    }, [fontSize]);

    // Color theme effect
    useEffect(() => {
        localStorage.setItem('colorTheme', colorTheme);
        document.documentElement.setAttribute('data-color-theme', colorTheme);
    }, [colorTheme]);

    const fetchExpenses = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                const formattedExpenses = data.data.map(expense => {
                    const createdAt = new Date(expense.created_at + 'Z');
                    const indiaTime = new Date(createdAt.getTime() + (5.5 * 60 * 60 * 1000));
                    
                    return {
                        id: expense.id,
                        category: expense.category_name || 'Other',
                        amount: expense.amount,
                        description: expense.description,
                        date: expense.date,
                        time: indiaTime.toLocaleTimeString('en-IN', {
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }),
                        icon: getCategoryIcon(expense.category_name),
                        color: expense.category_color || '#3b82f6'
                    };
                });
                setExpenses(formattedExpenses);
            }
        } catch (error) {
            console.error('Error fetching expenses:', error);
        }
    };

    const getCategoryIcon = (categoryName) => {
        const iconMap = {
            'Food & Dining': '🍽️',
            'Transportation': '🚌',
            'Shopping': '🛍️',
            'Education': '📚',
            'Travel': '✈️',
            'Other': '💰',
            'Healthcare': '🏥',
            'Entertainment': '🎬',
            'Bills & Utilities': '🏠'
        };
        return iconMap[categoryName] || '💰';
    };

    const toggleDarkMode = () => {
        setDarkMode(!darkMode);
    };

    const addExpense = async (expense) => {
        try {
            const indiaTime = new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" });
            const indiaDate = new Date(indiaTime);

            const categoryMap = {
                'Food & Dining': 1,
                'Transportation': 2,
                'Shopping': 3,
                'Education': 4,
                'Travel': 5,
                'Other': 6,
                'Healthcare': 7,
                'Entertainment': 8,
                'Bills & Utilities': 9
            };

            const expenseData = {
                title: expense.category,
                amount: expense.amount,
                category_id: categoryMap[expense.category] || 9,
                description: expense.description || '',
                date: indiaDate.toISOString().split('T')[0]
            };

            const response = await fetch(`${API_BASE_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(expenseData)
            });

            const data = await response.json();
            if (data.success) {
                fetchExpenses(); // Refresh the list
            }
        } catch (error) {
            console.error('Error adding expense:', error);
        }
    };

    const deleteExpense = async (id) => {
        try {
            const response = await fetch(`${API_BASE_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            const data = await response.json();
            if (data.success) {
                fetchExpenses(); // Refresh the list
            }
        } catch (error) {
            console.error('Error deleting expense:', error);
        }
    };

    const editExpense = async (updatedExpense) => {
        try {
            const categoryMap = {
                'Food & Dining': 1,
                'Transportation': 2,
                'Shopping': 3,
                'Education': 4,
                'Travel': 5,
                'Other': 6,
                'Healthcare': 7,
                'Entertainment': 8,
                'Bills & Utilities': 9
            };

            const expenseData = {
                title: updatedExpense.category,
                amount: updatedExpense.amount,
                category_id: categoryMap[updatedExpense.category] || 9,
                description: updatedExpense.description || '',
                date: updatedExpense.date
            };

            const response = await fetch(`${API_BASE_URL}/expenses/${updatedExpense.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(expenseData)
            });

            const data = await response.json();
            if (data.success) {
                fetchExpenses(); // Refresh the list
            }
        } catch (error) {
            console.error('Error updating expense:', error);
        }
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'Dashboard':
                return (
                    <div className="dashboard-content">
                        <Dashboard expenses={expenses} currency={currency} monthlyBudget={monthlyBudget} />
                        <div className="dashboard-right">
                            <ExpenseSummary expenses={expenses} currency={currency} />
                        </div>
                    </div>
                );
            case 'Expenses':
                return <ExpenseList expenses={expenses} onAddExpense={addExpense} onDeleteExpense={deleteExpense} onEditExpense={editExpense} currency={currency} monthlyBudget={monthlyBudget} setMonthlyBudget={setMonthlyBudget} />;
            case 'Accounts':
                return <Accounts expenses={expenses} currency={currency} userProfile={user} setUserProfile={setUserProfile} />;
            case 'Settings':
                return <Settings darkMode={darkMode} toggleDarkMode={toggleDarkMode} currency={currency} setCurrency={setCurrency} fontSize={fontSize} setFontSize={setFontSize} colorTheme={colorTheme} setColorTheme={setColorTheme} />;
            default:
                return (
                    <div className="dashboard-content">
                        <Dashboard expenses={expenses} currency={currency} monthlyBudget={monthlyBudget} />
                        <div className="dashboard-right">
                            <ExpenseSummary expenses={expenses} currency={currency} />
                        </div>
                    </div>
                );
        }
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };

    return (
        <div className={`app ${darkMode ? 'dark-mode' : ''}`}>
            <button className="mobile-menu-toggle" onClick={toggleMobileMenu}>
                ☰
            </button>
            <div className={`mobile-overlay ${isMobileMenuOpen ? 'active' : ''}`} onClick={closeMobileMenu}></div>
            <Sidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                isMobileOpen={isMobileMenuOpen}
                onMobileClose={closeMobileMenu}
            />
            <main className="main-content">
                {renderContent()}
            </main>
        </div>
    );
}


function App() {
    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;
