import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHistory, FaSearch, FaDownload, FaTrashAlt,
  FaSpinner, FaCircle, FaChevronLeft, FaChevronRight, FaTerminal, FaFilter
} from 'react-icons/fa';
import { api } from '../../services/api';
import { toast } from 'react-hot-toast';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { opacity: 1, x: 0 }
};

const AuditLogs = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const activeSearchTerm = searchParams.get('q') || searchTerm;
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 1
  });

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const result = await api.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        category: category,
        status: statusFilter,
        search: activeSearchTerm
      });
      setLogs(result.data);
      setPagination(prev => ({
        ...prev,
        total: result.pagination.total,
        pages: result.pagination.pages
      }));
    } catch (error) {
      toast.error('Failed to load audit logs');
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, category, statusFilter, activeSearchTerm]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchLogs();
    }, activeSearchTerm ? 500 : 0);

    return () => clearTimeout(delayDebounceFn);
  }, [fetchLogs, activeSearchTerm]);

  const updateSearch = (value) => {
    setSearchTerm(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  // Reset page when filters change
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }));
  }, [category, statusFilter, activeSearchTerm]);

  const handlePurge = async () => {
    if (!window.confirm('Are you absolutely sure you want to purge all audit history? This action cannot be undone.')) return;
    
    try {
      await api.purgeAuditLogs();
      setLogs([]);
      setPagination(prev => ({ ...prev, total: 0, pages: 1, page: 1 }));
      toast.success('Audit history purged successfully');
    } catch {
      toast.error('Failed to purge logs');
    }
  };

  const handleExport = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Timestamp,Action,User,IP Address,Status,Details\n"
      + logs.map(l => `${new Date(l.createdAt).toLocaleString()},${l.action},${l.user?.email || 'System'},${l.ipAddress},${l.status},"${l.details}"`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `KlickTour_Audit_Logs_Page${pagination.page}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.info('Exported current page results');
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
          <div className="dashboard-title-wrapper">
            <div className="logo-icon pulse-primary"><FaTerminal /></div>
            <div>
                <h1>Audit Protocols</h1>
                <p>Track admin actions, security events, and system activity history.</p>
            </div>
          </div>
        </div>
        <div className="module-actions">
          <button onClick={handleExport} className="btn btn-ghost">
            <FaDownload /> Export Intelligence
          </button>
          <button onClick={handlePurge} className="btn btn-danger-soft">
            <FaTrashAlt /> Purge Data
          </button>
        </div>
      </header>

      <div className="content-card glass-effect">
        <div className="filter-system-wrapper">
          <div className="search-filter-row">
            <div className="header-search">
              <FaSearch className="search-icon" />
              <input 
                type="text" 
                placeholder="Search action protocol, principal or IP..." 
                className="admin-input"
                value={activeSearchTerm}
                onChange={(e) => updateSearch(e.target.value)}
              />
            </div>
            
            <div className="status-filter-group">
              <div className="filter-label"><FaFilter /> Status Filter</div>
              <div className="filter-pills">
                {['All', 'success', 'warning', 'failure', 'info'].map(s => (
                  <button 
                    key={s}
                    onClick={() => setStatusFilter(s)}
                    className={`filter-pill ${statusFilter === s ? 'active' : ''}`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="category-filter-row">
            <div className="filter-label">Operational Category</div>
            <div className="category-pills">
                {['All', 'Security', 'User', 'Booking', 'Package', 'System', 'Coupon', 'Destination', 'Hotel', 'Transportation', 'Review'].map(t => (
                <button 
                  key={t}
                  onClick={() => setCategory(t)}
                  className={`category-pill ${category === t ? 'active' : ''}`}
                >
                  {t}
                </button>
                ))}
            </div>
          </div>
        </div>

        <div className="table-responsive">
          {loading ? (
            <div className="loading-state">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="loading-spinner"
              />
              <p>SYNCHRONIZING WITH CORE DATABASE...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="empty-state">
              <FaHistory className="empty-icon" />
              <p>No tactical logs found matching your parameters.</p>
            </div>
          ) : (
            <>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Temporal Stamp</th>
                    <th>Action Protocol</th>
                    <th>Security Principal</th>
                    <th>Origin IP</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  <AnimatePresence mode="popLayout">
                    {logs.map((log) => (
                      <motion.tr 
                        key={log._id}
                        variants={itemVariants}
                        layout
                      >
                        <td className="date-cell">
                          {new Date(log.createdAt).toLocaleString()}
                        </td>
                        <td>
                          <div className="action-name">{log.action}</div>
                          <div className="action-details">{log.details}</div>
                        </td>
                        <td>
                          <div className="user-cell">
                            <div className="user-avatar-small primary-gradient">
                              {log.user?.name ? log.user.name.charAt(0) : 'S'}
                            </div>
                            <div className="user-info-small">
                              <div className="name">{log.user?.name || 'System Engine'}</div>
                              <div className="id">{log.user?.email || 'Automated Task'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="ip-cell">
                          {log.ipAddress}
                        </td>
                        <td>
                          <span className={`status-pill status-${log.status === 'success' ? 'active' : log.status === 'failure' ? 'danger' : 'pending'}`}>
                            <FaCircle className="dot" /> {log.status}
                          </span>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {/* Standardized Pagination */}
              <div className="pagination-footer">
                <div className="pagination-info">
                  Showing <span>{logs.length}</span> of <span>{pagination.total}</span> logs
                </div>
                <div className="pagination-controls">
                  <button 
                    onClick={() => setPagination(p => ({ ...p, page: Math.max(1, p.page - 1) }))}
                    disabled={pagination.page === 1 || loading}
                    className="pagination-btn"
                  >
                    <FaChevronLeft />
                  </button>
                  
                  <div className="pagination-current">
                    Page <span>{pagination.page}</span> of {pagination.pages}
                  </div>

                  <button 
                    onClick={() => setPagination(p => ({ ...p, page: Math.min(p.pages, p.page + 1) }))}
                    disabled={pagination.page === pagination.pages || loading}
                    className="pagination-btn"
                  >
                    <FaChevronRight />
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default AuditLogs;
