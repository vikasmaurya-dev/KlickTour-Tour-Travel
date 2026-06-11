import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCog, FaGlobe, FaShieldAlt, FaBell, FaPalette, FaSave, FaDatabase } from 'react-icons/fa';
import '../ModernAdmin.css';

const SETTINGS_STORAGE_KEY = 'klicktour_admin_settings';

const DEFAULT_SETTINGS = {
  siteName: 'KlickTour',
  siteEmail: 'admin@klicktour.com',
  currency: 'INR',
  maintenanceMode: false,
  enableReviews: true,
  autoConfirmBookings: false,
  primaryColor: '#38bdf8',
  theme: 'dark'
};

const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  const [settings, setSettings] = useState(() => {
    try {
      const savedSettings = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}');
      return { ...DEFAULT_SETTINGS, ...savedSettings };
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  useEffect(() => {
    if (!saveMessage) return undefined;
    const timer = setTimeout(() => setSaveMessage(''), 2500);
    return () => clearTimeout(timer);
  }, [saveMessage]);

  const handleSave = () => {
    setLoading(true);
    setTimeout(() => {
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
      setLoading(false);
      setSaveMessage('Settings saved successfully.');
    }, 1000);
  };

  const tabs = [
    { id: 'general', icon: <FaGlobe />, label: 'General' },
    { id: 'security', icon: <FaShieldAlt />, label: 'Security' },
    { id: 'notifications', icon: <FaBell />, label: 'Notifications' },
    { id: 'appearance', icon: <FaPalette />, label: 'Appearance' },
    { id: 'system', icon: <FaDatabase />, label: 'System' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="admin-module"
    >
      <div className="admin-header" style={{ gap: '1rem', flexWrap: 'wrap' }}>
        <div className="admin-title-section">
          <h1>Admin Settings</h1>
          <p>Configure platform defaults, security preferences, and visual settings.</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', flexWrap: 'wrap' }}>
          {saveMessage && (
            <span style={{ color: 'var(--admin-success)', fontWeight: 700, fontSize: '0.9rem' }}>
              {saveMessage}
            </span>
          )}
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={loading}
            style={{ flexShrink: 0 }}
          >
            <FaSave /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="settings-container" style={{ display: 'flex', gap: '2rem' }}>
        <aside className="settings-tabs" style={{ width: '240px' }}>
          {tabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '1rem',
                marginBottom: '8px',
                border: 'none',
                borderRadius: '12px',
                background: activeTab === tab.id ? 'var(--admin-primary)' : 'var(--admin-card-bg)',
                color: activeTab === tab.id ? 'white' : 'var(--admin-text-muted)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: 600
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </aside>

        <main className="settings-content" style={{ flex: 1 }}>
          <div className="data-card" style={{ padding: '2rem' }}>
            {activeTab === 'general' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <h2 style={{ marginBottom: '1.5rem' }}>General Configuration</h2>
                <div className="settings-form" style={{ display: 'grid', gap: '1.5rem' }}>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--admin-text-muted)' }}>Site Name</label>
                    <input 
                      type="text" 
                      className="admin-input" 
                      style={{ width: '100%' }}
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--admin-text-muted)' }}>Support Email</label>
                    <input 
                      type="email" 
                      className="admin-input" 
                      style={{ width: '100%' }}
                      value={settings.siteEmail}
                      onChange={(e) => setSettings({...settings, siteEmail: e.target.value})}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ display: 'block', marginBottom: '8px', color: 'var(--admin-text-muted)' }}>Default Currency</label>
                    <select 
                      className="admin-input" 
                      style={{ width: '100%' }}
                      value={settings.currency}
                      onChange={(e) => setSettings({...settings, currency: e.target.value})}
                    >
                      <option value="INR">INR - Indian Rupee</option>
                      <option value="USD">USD - US Dollar</option>
                      <option value="EUR">EUR - Euro</option>
                      <option value="GBP">GBP - British Pound</option>
                    </select>
                  </div>
                  <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input 
                      type="checkbox" 
                      id="maint"
                      checked={settings.maintenanceMode}
                      onChange={(e) => setSettings({...settings, maintenanceMode: e.target.checked})}
                    />
                    <label htmlFor="maint">Maintenance Mode</label>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab !== 'general' && (
              <div style={{ textAlign: 'center', padding: '4rem 0', color: 'var(--admin-text-muted)' }}>
                <FaCog style={{ fontSize: '3rem', marginBottom: '1rem', opacity: 0.5 }} />
                <h3>{tabs.find(t => t.id === activeTab)?.label} Settings</h3>
                <p>This module is currently being optimized. Configuration options will be available soon.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </motion.div>
  );
};

export default Settings;
