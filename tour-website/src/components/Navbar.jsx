import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FaBars,
  FaChevronDown,
  FaCog,
  FaMoon,
  FaSignOutAlt,
  FaSun,
  FaTimes,
  FaUserCircle,
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getUserFirstName } from '../utils/googleAuth';
import './Navbar.css';

const Navbar = ({ theme, toggleTheme }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAdmin } = useAuth();

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) {
        setAccountMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsOpen(false);
    setAccountMenuOpen(false);
  }, [location.pathname]);

  const navLinks = useMemo(() => ([
    { name: 'Home', path: '/' },
    { name: 'Destinations', path: '/destinations' },
    { name: 'Packages', path: '/packages' },
    { name: 'Travel Mode', path: '/transportation' },
    // { name: 'About', path: '/about' },
    { name: 'Hotels', path: '/hotels' },
    { name: 'Contact', path: '/contact' },
  ]), []);

  const closeMenus = () => {
    setIsOpen(false);
    setAccountMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMenus();
    navigate('/');
  };

  const renderAvatar = (size = 'md') => {
    const avatarSizeClass = size === 'sm'
      ? 'navbar-avatar navbar-avatar-sm'
      : size === 'lg'
        ? 'navbar-avatar navbar-avatar-lg'
        : 'navbar-avatar navbar-avatar-md';

    if (user?.avatar) {
      return (
        <img
          src={user.avatar}
          alt={user.name}
          className={`navbar-avatar-image ${avatarSizeClass}`}
        />
      );
    }

    return (
      <span className={`navbar-avatar-fallback ${avatarSizeClass}`}>
        {getUserFirstName(user?.name).slice(0, 1).toUpperCase()}
      </span>
    );
  };

  return (
    <nav className={`main-navbar ${theme === 'dark' ? 'theme-dark' : 'theme-light'}`}>
      <div className="main-navbar__inner">
        <Link to="/" className="navbar-brand" onClick={closeMenus}>
          <img
            src="/klicktour-logo-dark-cropped.png"
            alt="KlickTour"
            className="navbar-brand__logo navbar-logo"
          />
        </Link>

        <div className="navbar-links desktop-nav">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={closeMenus}
              className={({ isActive }) =>
                `navbar-link ${isActive ? 'is-active' : ''}`
              }
            >
              <span className="navbar-link__label">{link.name}</span>
            </NavLink>
          ))}
        </div>

        <div className="navbar-actions desktop-nav">
          {isAdmin ? (
            <Link
              to="/admin"
              onClick={closeMenus}
              className="navbar-admin-pill"
            >
              <FaCog size={12} />
              <span>Admin</span>
            </Link>
          ) : null}

          <button
            onClick={toggleTheme}
            className="navbar-icon-btn"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>

          {user ? (
            <div className="navbar-account" ref={dropdownRef}>
              <button
                onClick={() => setAccountMenuOpen((open) => !open)}
                className="navbar-account-btn"
                aria-expanded={accountMenuOpen}
                aria-haspopup="menu"
              >
                {renderAvatar()}
                <div className="navbar-account-text">
                  <p className="navbar-account-welcome">Welcome</p>
                  <p className="navbar-account-name">{getUserFirstName(user.name)}</p>
                </div>
                <FaChevronDown className={`navbar-chevron ${accountMenuOpen ? 'is-open' : ''}`} />
              </button>

              <AnimatePresence>
                {accountMenuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 6 }}
                    className="navbar-dropdown"
                  >
                    <div className="navbar-dropdown-header">
                      {renderAvatar('lg')}
                      <div>
                        <p className="navbar-dropdown-name">{user.name}</p>
                        <p className="navbar-dropdown-email">{user.email}</p>
                      </div>
                    </div>

                    <div className="navbar-dropdown-content">
                      <Link
                        to="/profile"
                        onClick={closeMenus}
                        className="navbar-dropdown-item"
                      >
                        <FaUserCircle className="navbar-dropdown-icon" />
                        <span>My Profile</span>
                      </Link>

                      {isAdmin ? (
                        <Link
                          to="/admin"
                          onClick={closeMenus}
                          className="navbar-dropdown-item"
                        >
                          <FaCog className="navbar-dropdown-icon" />
                          <span>Admin Dashboard</span>
                        </Link>
                      ) : null}

                      <button
                        onClick={handleLogout}
                        className="navbar-dropdown-item logout"
                      >
                        <FaSignOutAlt />
                        <span>Logout</span>
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          ) : (
            <div className="navbar-auth-links">
              <Link
                to="/login"
                onClick={closeMenus}
                className="navbar-login-link"
              >
                Login
              </Link>
              <Link
                to="/signup"
                onClick={closeMenus}
                className="navbar-signup-btn"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        <div className="navbar-mobile-controls mobile-nav">
          {user ? (
            <button
              onClick={() => {
                closeMenus();
                navigate('/profile');
              }}
              className="navbar-mobile-profile"
            >
              {renderAvatar('sm')}
            </button>
          ) : null}

          <button
            onClick={toggleTheme}
            className="navbar-icon-btn"
            aria-label="Toggle Theme"
          >
            {theme === 'light' ? <FaMoon size={18} /> : <FaSun size={18} />}
          </button>

          <button
            onClick={() => setIsOpen((open) => !open)}
            className="navbar-menu-btn"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="navbar-mobile-panel"
          >
            <div className="navbar-mobile-panel-inner">
              {navLinks.map((link) => (
                <NavLink
                  key={link.name}
                  to={link.path}
                  onClick={closeMenus}
                  className={({ isActive }) =>
                    `navbar-mobile-link ${isActive ? 'is-active' : ''}`
                  }
                >
                  {link.name}
                </NavLink>
              ))}

              <div className="navbar-mobile-actions">
                {isAdmin ? (
                  <Link to="/admin" onClick={closeMenus} className="navbar-mobile-admin-link">
                    <FaCog />
                    <span>Admin Dashboard</span>
                  </Link>
                ) : null}

                {user ? (
                  <>
                    <Link to="/profile" onClick={closeMenus} className="navbar-mobile-user-card">
                      {renderAvatar('md')}
                      <div>
                        <p className="navbar-mobile-user-name">{user.name}</p>
                        <p className="navbar-mobile-user-email">{user.email}</p>
                      </div>
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="navbar-mobile-logout"
                    >
                      <FaSignOutAlt />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <div className="navbar-mobile-auth">
                    <Link
                      to="/login"
                      onClick={closeMenus}
                      className="navbar-mobile-login"
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      onClick={closeMenus}
                      className="navbar-mobile-signup"
                    >
                      Sign Up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
