import React from 'react';
import {
    LayoutDashboard,
    Receipt,
    CreditCard,
    Settings
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, setActiveTab, isMobileOpen, onMobileClose }) => {
    const menuItems = [
        { name: 'Dashboard', icon: LayoutDashboard },
        { name: 'Expenses', icon: Receipt },
        { name: 'Accounts', icon: CreditCard },
        { name: 'Settings', icon: Settings }
    ];

    return (
        <div className={`sidebar ${isMobileOpen ? 'mobile-open' : ''}`}>
            <div className="sidebar-header">
                <div className="logo-text">
                    <h2>TrackMySpend</h2>
                    <p>Track It. Save It. Love It</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {menuItems.map((item) => {
                    const IconComponent = item.icon;
                    return (
                        <button
                            key={item.name}
                            className={`nav-item ${activeTab === item.name ? 'active' : ''}`}
                            onClick={() => {
                                setActiveTab(item.name);
                                onMobileClose && onMobileClose();
                            }}
                        >
                            <IconComponent size={20} />
                            <span>{item.name}</span>
                        </button>
                    );
                })}
            </nav>
        </div>
    );
};

export default Sidebar;
