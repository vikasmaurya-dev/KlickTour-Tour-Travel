import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaTrash, FaSearch, FaUserShield, FaUser, FaUserCheck, 
  FaUserTimes, FaEnvelope, FaShieldAlt, FaFilter, FaPlus,
  FaArrowUp, FaBolt, FaIdBadge, FaHistory, FaEllipsisV
} from 'react-icons/fa';
import { api } from '../../../services/api';
import { useAuth } from '../../../context/AuthContext';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Users = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filterRole, setFilterRole] = useState('All');
  const [openMenuId, setOpenMenuId] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    admins: 0,
    regular: 0,
    engagement: 92
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getUsers();
      setItems(data);
      
      const newStats = data.reduce((acc, curr) => {
        acc.total++;
        if (curr.role === 'admin') acc.admins++;
        else acc.regular++;
        return acc;
      }, { total: 0, admins: 0, regular: 0 });
      setStats({ ...newStats, engagement: 92 });
    } catch (err) {
      console.error('Failed to load personnel:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const updateSearch = (value) => {
    setSearch(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to purge this personnel record? This action is irreversible.')) {
      try {
        await api.deleteUser(id);
        loadItems();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const handleRoleChange = async (item, role) => {
    const action = role === 'admin' ? 'grant admin access to' : 'remove admin access from';
    if (!window.confirm(`Are you sure you want to ${action} ${item.email}?`)) return;

    try {
      await api.updateUserRole(item._id, role);
      setOpenMenuId(null);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeSearch = searchParams.get('q') || search;
  const filteredItems = items.filter(item => {
    const matchesSearch = matchesSearchFields(item, activeSearch, [
      'name',
      'email',
      'role',
      '_id',
      'phone',
    ]);
    
    const matchesRole = filterRole === 'All' || item.role === filterRole.toLowerCase();
    
    return matchesSearch && matchesRole;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="admin-module"
    >
      <header className="module-header">
        <div className="module-title-section">
          <h1>User Management</h1>
          <p>View, manage, and control registered users and admin roles.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaHistory /> Audit Logs
          </button>
          <button className="btn btn-primary">
            <FaPlus /> Provision User
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-primary-tint">
            <FaUser />
          </div>
          <div className="stat-info">
            <p>Global Personnel</p>
            <h3>{stats.total.toLocaleString()}</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> +24 new recruits
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-warning-tint">
            <FaShieldAlt />
          </div>
          <div className="stat-info">
            <p>Admin Clearance</p>
            <h3>{stats.admins}</h3>
            <div className="stat-badge-mini">Level 1 Protocol</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>Community Pulse</p>
              <span className="stat-value-highlight">{stats.engagement}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar-fill success-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.engagement}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="stat-meta-tag">
              <FaBolt /> Active engagement monitoring
            </div>
          </div>
        </motion.div>
      </div>

      <div className="content-card glass-effect">
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search personnel by name, email or ID..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="tab-controls">
            {['All', 'Admin', 'User'].map(role => (
              <button 
                key={role}
                className={`tab-btn ${filterRole === role ? 'active' : ''}`}
                onClick={() => setFilterRole(role)}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Personnel Profile</th>
                <th>Clearance</th>
                <th>Activity Index</th>
                <th>Joined Protocol</th>
                <th className="text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="5">
                      <AdminLoader message="Retrieving Personnel Directory..." />
                    </td>
                  </tr>
                ) : filteredItems.map((item) => (
                  <motion.tr 
                    key={item._id}
                    variants={itemVariants}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                  >
                    <td>
                      <div className="asset-cell">
                        <div className={`user-avatar-initials ${item.role === 'admin' ? 'primary-gradient' : 'accent-gradient'}`}>
                          {item.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="asset-info">
                          <span className="asset-name-text">{item.name}</span>
                          <span className="asset-meta-text">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${item.role === 'admin' ? 'status-processing' : 'status-muted'}`}>
                        {item.role === 'admin' ? <FaShieldAlt /> : <FaUser />}
                        {item.role}
                      </span>
                    </td>
                    <td>
                      <div className="activity-index">
                        <div className="pulse-indicator">
                          <span className="pulse-dot active" />
                          <span>ACTIVE</span>
                        </div>
                        <div className="mini-activity-bar">
                          <div className="bar-fill primary-gradient" style={{ width: '85%' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-main">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="date-sub">ISO-8601 LOG</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="btn-icon-small" title="Edit Profile">
                          <FaIdBadge />
                        </button>
                        {item.role !== 'admin' && (
                          <button 
                            className="btn-icon-small danger" 
                            onClick={() => handleDelete(item._id)} 
                            title="Purge Record"
                          >
                            <FaTrash />
                          </button>
                        )}
                        <div className="row-action-menu">
                        <button
                          className="btn-icon-small"
                          title="More Options"
                          onClick={() => setOpenMenuId(openMenuId === item._id ? null : item._id)}
                        >
                          <FaEllipsisV />
                        </button>
                        {openMenuId === item._id && (
                          <motion.div
                            className="row-action-dropdown glass-effect"
                            initial={{ opacity: 0, y: 8, scale: 0.96 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 8, scale: 0.96 }}
                          >
                            {item.role !== 'admin' ? (
                              <button type="button" onClick={() => handleRoleChange(item, 'admin')}>
                                <FaUserShield /> Make Admin
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleRoleChange(item, 'user')}
                                disabled={user?._id === item._id}
                                title={user?._id === item._id ? 'You cannot remove your own admin access' : 'Change to user'}
                              >
                                <FaUser /> Make User
                              </button>
                            )}
                          </motion.div>
                        )}
                        </div>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && filteredItems.length === 0 && (
          <div className="empty-state-container">
            <div className="empty-state-icon">
              <FaIdBadge />
            </div>
            <h3>No Users Found</h3>
            <p>Your search criteria did not match any registered users.</p>
            <button 
              onClick={() => {setFilterRole('All'); updateSearch('');}}
              className="btn btn-primary"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Users;
