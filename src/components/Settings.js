import React from 'react';
import { Moon, Sun, Globe, Type, Palette } from 'lucide-react';
import './Settings.css';

const Settings = ({ darkMode, toggleDarkMode, currency, setCurrency, fontSize, setFontSize, colorTheme, setColorTheme }) => {

  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'IDR', name: 'Indonesian Rupiah', symbol: 'Rp' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  const fontSizes = [
    { value: 'small', name: 'Small' },
    { value: 'medium', name: 'Medium' },
    { value: 'large', name: 'Large' },
    { value: 'extra-large', name: 'Extra Large' }
  ];

  const colorThemes = [
    { value: 'midnight', name: 'Midnight Blue', preview: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)' },
    { value: 'default', name: 'Ocean Blue', preview: 'linear-gradient(135deg, #8b5cf6 0%, #a78bfa 100%)' },
    { value: 'sunset', name: 'Sunset Orange', preview: 'linear-gradient(135deg, #f97316 0%, #fb923c 100%)' },
    { value: 'forest', name: 'Forest Green', preview: 'linear-gradient(135deg, #22c55e 0%, #4ade80 100%)' },
    { value: 'lavender', name: 'Lavender Purple', preview: 'linear-gradient(135deg, #a855f7 0%, #c084fc 100%)' },
    { value: 'rose', name: 'Rose Gold', preview: 'linear-gradient(135deg, #ec4899 0%, #f472b6 100%)' }
  ];

  return (
    <div className="settings">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your preferences and currency settings</p>
      </div>

      <div className="settings-content">
        {/* Appearance Settings */}
        <div className="settings-group">
          <h2>Appearance</h2>
          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-icon">
                  {darkMode ? <Sun size={20} /> : <Moon size={20} />}
                </div>
                <div className="settings-item-text">
                  <h3>Dark Mode</h3>
                  <p>Toggle between light and dark theme</p>
                </div>
              </div>
              <div className="settings-item-control">
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-icon">
                  <Type size={20} />
                </div>
                <div className="settings-item-text">
                  <h3>Font Size</h3>
                  <p>Adjust text size for better readability</p>
                </div>
              </div>
              <div className="settings-item-control">
                <select
                  value={fontSize}
                  onChange={(e) => setFontSize(e.target.value)}
                  className="settings-select"
                >
                  {fontSizes.map(size => (
                    <option key={size.value} value={size.value}>
                      {size.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-icon">
                  <Palette size={20} />
                </div>
                <div className="settings-item-text">
                  <h3>Color Theme</h3>
                  <p>Choose your preferred color scheme</p>
                </div>
              </div>
              <div className="settings-item-control">
                <div className="color-theme-grid">
                  {colorThemes.map(theme => (
                    <div
                      key={theme.value}
                      className={`color-theme-option ${colorTheme === theme.value ? 'active' : ''}`}
                      onClick={() => setColorTheme(theme.value)}
                    >
                      <div
                        className="color-preview"
                        style={{ background: theme.preview }}
                      ></div>
                      <div className="color-theme-info">
                        <span className="theme-name">{theme.name}</span>
                        <span className="theme-description">{theme.description}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="settings-group">
          <h2>Currency</h2>
          <div className="settings-items">
            <div className="settings-item">
              <div className="settings-item-info">
                <div className="settings-item-icon">
                  <Globe size={20} />
                </div>
                <div className="settings-item-text">
                  <h3>Default Currency</h3>
                  <p>Set your preferred currency for expenses</p>
                </div>
              </div>
              <div className="settings-item-control">
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="settings-select"
                >
                  {currencies.map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} {curr.code} - {curr.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
