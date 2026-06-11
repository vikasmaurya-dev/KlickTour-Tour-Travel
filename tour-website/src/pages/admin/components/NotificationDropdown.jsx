import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaBell, FaCheckCircle, FaExclamationTriangle, FaInfoCircle, FaTimesCircle, FaUserPlus } from 'react-icons/fa';
import { api } from '../../../services/api';
import { useNavigate } from 'react-router-dom';

const NotificationDropdown = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const [filter, setFilter] = useState('All');
  const lastReadTimestamp = parseInt(localStorage.getItem('klicktour_admin_last_read_notifications'), 10) || 0;

  const fetchNotifications = useCallback(async () => {
    try {
      const params = { limit: 15 };
      if (filter === 'Errors') params.status = 'failure';
      if (filter === 'Security') params.category = 'Security';
      if (filter === 'User') params.category = 'User';

      const res = await api.getAuditLogs(params);
      if (res.success && res.data) {
        setNotifications(res.data);
        
        const lastReadTime = parseInt(localStorage.getItem('klicktour_admin_last_read_notifications'), 10) || 0;
        const unread = res.data.filter(log => new Date(log.createdAt).getTime() > lastReadTime);
        setUnreadCount(unread.length);
      }
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchNotifications();
    const intervalId = setInterval(fetchNotifications, 30000); // Poll every 30 seconds
    return () => clearInterval(intervalId);
  }, [fetchNotifications]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      localStorage.setItem('klicktour_admin_last_read_notifications', Date.now().toString());
      setUnreadCount(0);
    }
  };

  const getIcon = (log) => {
    if (log.action.includes('Register') || log.category === 'User') return <FaUserPlus className="icon-user" />;
    if (log.status === 'success') return <FaCheckCircle className="icon-success" />;
    if (log.status === 'warning') return <FaExclamationTriangle className="icon-warning" />;
    if (log.status === 'failure') return <FaTimesCircle className="icon-danger" />;
    return <FaInfoCircle className="icon-info" />;
  };

  const getTimeAgo = (dateString) => {
    const seconds = Math.floor((new Date() - new Date(dateString)) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " yr ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hr ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " min ago";
    return "Just now";
  };

  return (
    <div className="notification-dropdown-container" ref={dropdownRef}>
      <button className="action-btn notification-btn" onClick={handleToggle}>
        <FaBell />
        {unreadCount > 0 && (
          <motion.span 
            className="notification-badge"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
          >
            {unreadCount > 9 ? '9+' : unreadCount}
          </motion.span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="notification-dropdown-menu glass-effect"
          >
            <div className="notification-header">
              <h3>System Alerts</h3>
              <button 
                className="view-all-btn"
                onClick={() => { setIsOpen(false); navigate('/admin/settings'); }}
              >
                Settings
              </button>
            </div>

            <div className="notification-filters">
              {['All', 'Errors', 'Security', 'User'].map(f => (
                <button 
                  key={f}
                  className={`filter-btn ${filter === f ? 'active' : ''}`}
                  onClick={() => setFilter(f)}
                >
                  {f}
                </button>
              ))}
            </div>
            
            <div className="notification-list">
              {loading ? (
                <div className="notification-empty">Loading logs...</div>
              ) : notifications.length === 0 ? (
                <div className="notification-empty">No new notifications</div>
              ) : (
                notifications.map(log => {
                    const isUnread = new Date(log.createdAt).getTime() > lastReadTimestamp;
                    return (
                      <motion.div 
                        key={log._id} 
                        className={`notification-item ${isUnread ? 'unread' : ''}`}
                        whileHover={{ backgroundColor: "rgba(255, 255, 255, 0.05)", x: 4 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="notification-icon">
                          {getIcon(log)}
                        </div>
                        <div className="notification-content">
                          <p className="notification-title">{log.action}</p>
                          <p className="notification-details">{log.details}</p>
                          <span className="notification-time">{getTimeAgo(log.createdAt)}</span>
                        </div>
                        {isUnread && <div className="notification-dot"></div>}
                      </motion.div>
                    );
                  })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationDropdown;
