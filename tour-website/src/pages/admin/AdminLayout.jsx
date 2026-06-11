import React, { useState } from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChartLine, FaBox, FaMapMarkedAlt, FaHotel, FaBus, 
  FaCalendarCheck, FaUsers, FaStar,
  /* FaCreditCard, FaEnvelope, FaTicketAlt, */
  FaCog, FaSignOutAlt, FaChevronRight,
  FaSearch, FaBell, FaUserCircle, FaBars, FaTimes, FaGlobe
} from 'react-icons/fa';
import NotificationDropdown from './components/NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import './ModernAdmin.css';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const menuItems = [
    { path: '/admin', icon: <FaChartLine />, label: 'Dashboard', exact: true },
    { path: '/admin/packages', icon: <FaBox />, label: 'Manage Packages' },
    { path: '/admin/destinations', icon: <FaMapMarkedAlt />, label: 'Manage Destinations' },
    { path: '/admin/hotels', icon: <FaHotel />, label: 'Manage Hotels' },
    { path: '/admin/transportation', icon: <FaBus />, label: 'Manage Transportation' },
    { path: '/admin/bookings', icon: <FaCalendarCheck />, label: 'Manage Bookings' },
    { path: '/admin/users', icon: <FaUsers />, label: 'Manage Users' },
    { path: '/admin/reviews', icon: <FaStar />, label: 'Reviews' },
    /*
    { path: '/admin/messages', icon: <FaEnvelope />, label: 'Messages' },
    { path: '/admin/coupons', icon: <FaTicketAlt />, label: 'Coupons' },
    { path: '/admin/payments', icon: <FaCreditCard />, label: 'Payments' },
    */
    { path: '/admin/settings', icon: <FaCog />, label: 'Settings' },
  ];

  const isActive = (path, exact) => {
    if (exact) return location.pathname === '/admin';
    return location.pathname.startsWith(path) && path !== '/admin';
  };

  const getPageTitle = () => {
    const current = menuItems.find(item => isActive(item.path, item.exact));
    return current ? current.label : 'Admin Panel';
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const getSearchTarget = (query) => {
    const normalized = query.toLowerCase();
    if (/(hotel|stay|room|property)/.test(normalized)) return '/admin/hotels';
    if (/(package|tour|trip|inventory)/.test(normalized)) return '/admin/packages';
    if (/(destination|place|city|location)/.test(normalized)) return '/admin/destinations';
    if (/(transport|logistic|bus|cab|car|train|flight)/.test(normalized)) return '/admin/transportation';
    if (/(booking|reservation|invoice)/.test(normalized)) return '/admin/bookings';
    if (/(user|agent|admin|customer)/.test(normalized)) return '/admin/users';
    if (/(review|rating|sentiment)/.test(normalized)) return '/admin/reviews';
    /*
    if (/(message|contact|inquiry|mail)/.test(normalized)) return '/admin/messages';
    if (/(coupon|promo|discount|incentive)/.test(normalized)) return '/admin/coupons';
    if (/(payment|transaction|financial)/.test(normalized)) return '/admin/payments';
    */
    if (/(log|audit|security|error)/.test(normalized)) return '/admin/audit-logs';
    return location.pathname === '/admin' ? '/admin/bookings' : location.pathname;
  };

  const handleHeaderSearch = (event) => {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) return;
    navigate(`${getSearchTarget(query)}?q=${encodeURIComponent(query)}`);
  };

  return (
    <div className={`admin-dashboard-root ${!isSidebarOpen ? 'sidebar-collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className={`admin-sidebar glass-effect ${isSidebarOpen ? 'open' : 'collapsed'}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <span className="logo-icon"><FaGlobe /></span>
            {isSidebarOpen && <span className="logo-text">KlickTour</span>}
          </div>
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {menuItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className={`sidebar-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
              title={item.label}
            >
              <span className="sidebar-icon">{item.icon}</span>
              {isSidebarOpen && <span className="sidebar-label">{item.label}</span>}
              {isActive(item.path, item.exact) && isSidebarOpen && (
                <motion.div 
                  layoutId="active-indicator"
                  className="active-indicator"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <button onClick={() => { logout(); navigate('/'); }} className="sidebar-link exit-link" style={{ background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer' }}>
            <FaSignOutAlt className="sidebar-icon" />
            {isSidebarOpen && <span>Portal Exit</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="admin-content-wrapper">
        {/* Top Header */}
        <header className="admin-top-header glass-effect">
          <div className="header-left">
            <div className="breadcrumb-system">
              <span className="breadcrumb-root">Admin</span>
              <FaChevronRight className="breadcrumb-separator" />
              <span className="breadcrumb-current">{getPageTitle()}</span>
            </div>
          </div>

          <div className="header-right">
            <form className="header-search" onSubmit={handleHeaderSearch}>
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search analytics, logs, users..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            
            <div className="header-actions">
              <NotificationDropdown />
              <button className="user-profile-trigger" type="button" onClick={() => navigate('/profile')}>
                <div className="user-info">
                  <span className="user-name">{user?.name || 'Super Admin'}</span>
                  <span className="user-role">{user?.role || 'System Architect'}</span>
                </div>
                <FaUserCircle className="user-avatar" />
              </button>
            </div>
          </div>
        </header>

        <main className="admin-main-viewport">
          <Outlet context={{ globalSearch: searchQuery }} />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
