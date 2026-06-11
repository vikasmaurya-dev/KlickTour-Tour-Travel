import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaCheck, FaTimes, FaSearch, FaCalendarCheck, 
  FaUser, FaDownload, FaWallet, FaCalendarDay,
  FaEllipsisV, FaFileInvoice, FaPlaneArrival, FaHistory,
  FaArrowUp, FaChartLine
} from 'react-icons/fa';
import { bookingService } from '../../../services/bookingService';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Bookings = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState('All');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    revenue: 0,
    velocity: 84
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await bookingService.getBookings();
      setItems(data);
      
      const newStats = data.reduce((acc, curr) => {
        acc.total++;
        const status = curr.status?.toLowerCase() || 'pending';
        if (status === 'confirmed') {
          acc.confirmed++;
          acc.revenue += (curr.totalPrice || 0);
        } else if (status === 'cancelled') {
          acc.cancelled++;
        } else {
          acc.pending++;
        }
        return acc;
      }, { total: 0, pending: 0, confirmed: 0, cancelled: 0, revenue: 0 });
      
      setStats({ ...newStats, velocity: 84 });
    } catch (err) {
      console.error(err);
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

  const updateStatus = async (id, status) => {
    try {
      await bookingService.updateBookingStatus(id, status);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const activeSearch = searchParams.get('q') || search;
  const filteredItems = items.filter(item => {
    const matchesSearch = matchesSearchFields(item, activeSearch, [
      'fullName',
      'email',
      'status',
      'invoiceNumber',
      'packageName',
      (row) => row.packageId?.name,
      (row) => row.packageId?.location,
      (row) => row.packageId?.category,
      (row) => row._id,
    ]);
    
    const matchesFilter = filter === 'All' || item.status === filter;
    
    return matchesSearch && matchesFilter;
  });

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed': return 'status-active';
      case 'cancelled': return 'status-danger';
      default: return 'status-pending';
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
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
          <h1>Booking Management</h1>
          <p>Track customer bookings, payment totals, and booking status updates.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaHistory /> Operations Log
          </button>
          <button className="btn btn-primary">
            <FaDownload /> Export Ledger
          </button>
        </div>
      </header>

      {/* Tactical Metrics */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-primary-tint">
            <FaCalendarCheck />
          </div>
          <div className="stat-info">
            <p>Active Acquisitions</p>
            <h3>{stats.total}</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> 12% cycle growth
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-success-tint">
            <FaWallet />
          </div>
          <div className="stat-info">
            <p>Fiscal Performance</p>
            <h3>₹{stats.revenue.toLocaleString()}</h3>
            <div className="stat-trend positive">
              <FaChartLine /> Optimal yield
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>System Velocity</p>
              <span className="stat-value-highlight">{stats.velocity}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar-fill success-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.velocity}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="stat-meta-tag">
              Capacity utilization index
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-warning-tint">
            <FaHistory style={{ transform: 'rotate(-45deg)' }} />
          </div>
          <div className="stat-info">
            <p>Awaiting Execution</p>
            <h3>{stats.pending}</h3>
            <div className="stat-badge-mini">Pending Override</div>
          </div>
        </motion.div>
      </div>

      <div className="content-card glass-effect">
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search principals, packages or identifiers..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="tab-controls">
            {['All', 'Pending', 'Confirmed', 'Cancelled'].map(s => (
              <button 
                key={s}
                className={`tab-btn ${filter === s ? 'active' : ''}`}
                onClick={() => setFilter(s)}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Principal Contact</th>
                <th>Asset Identity</th>
                <th>Execution Log</th>
                <th>Fiscal Impact</th>
                <th>Status</th>
                <th className="text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <AdminLoader message="Fetching Reservation Database..." />
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
                        <div className="user-avatar-initials primary-gradient">
                          {item.fullName?.charAt(0).toUpperCase()}
                        </div>
                        <div className="asset-info">
                          <span className="asset-name-text">{item.fullName}</span>
                          <span className="asset-meta-text">{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="asset-info">
                        <span className="asset-name-text">{item.packageId?.name || 'Classified Resource'}</span>
                        <span className="asset-meta-text">ID: {item._id.slice(-8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-main">
                          {new Date(item.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="date-sub">
                          <FaUser size={10} style={{ marginRight: '4px' }} /> {item.travelers} Units Logged
                        </span>
                      </div>
                    </td>
                    <td>
                      <div className="value-cell success-text">
                        ₹{item.totalPrice?.toLocaleString()}
                        <span className="value-unit">REALIZED</span>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${getStatusClass(item.status)}`}>
                        {item.status || 'Pending'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        {item.status === 'Pending' ? (
                          <>
                            <button 
                              onClick={() => updateStatus(item._id, 'Confirmed')}
                              className="btn-icon-small bg-success-tint"
                              title="Confirm Execution"
                            >
                              <FaCheck />
                            </button>
                            <button 
                              onClick={() => updateStatus(item._id, 'Cancelled')}
                              className="btn-icon-small danger"
                              title="Abort Protocol"
                            >
                              <FaTimes />
                            </button>
                          </>
                        ) : (
                          <button 
                            className="btn-icon-small"
                            title="Generate Invoice"
                          >
                            <FaFileInvoice />
                          </button>
                        )}
                        <button className="btn-icon-small" title="More Options">
                          <FaEllipsisV />
                        </button>
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
              <FaPlaneArrival />
            </div>
            <h3>Zero Data Packets</h3>
            <p>We couldn't locate any reservation records matching your current filter parameters or search query.</p>
            <button 
              onClick={() => {setFilter('All'); updateSearch('');}}
              className="btn btn-primary"
            >
              Reset Protocol Parameters
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Bookings;
