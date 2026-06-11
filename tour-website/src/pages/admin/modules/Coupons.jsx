import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaTicketAlt, FaCalendarTimes,
  FaArrowUp, FaChartPie, FaBolt, FaShieldAlt, FaHistory, FaTag
} from 'react-icons/fa';
import { api } from '../../../services/api';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Coupons = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [filter, setFilter] = useState('All');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const emptyForm = { code: '', description: '', discountType: 'percentage', discountValue: '', minAmount: '', expiresAt: '', active: true };
  const [form, setForm] = useState(emptyForm);
  const [stats, setStats] = useState({
    active: 0,
    total: 0,
    avgDiscount: 0,
    efficiency: 92
  });

  useEffect(() => {
    loadItems();
  }, []);

  const updateSearch = (value) => {
    setSearch(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  const loadItems = async () => {
    try {
      setLoading(true);
      const data = await api.getCoupons();
      setItems(data);
      
      const active = data.filter(i => i.active).length;
      const total = data.length;
      const avg = data.length > 0 ? (data.reduce((acc, curr) => acc + (Number(curr.discountValue) || 0), 0) / data.length).toFixed(1) : 0;
      
      setStats({
        active,
        total,
        avgDiscount: avg,
        efficiency: 92
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = {
      ...form,
      discountValue: Number(form.discountValue),
      minAmount: Number(form.minAmount || 0),
      expiresAt: form.expiresAt || undefined,
    };
    try {
      if (editing) {
        await api.updateCoupon(editing, data);
      } else {
        await api.createCoupon(data);
      }
      setShowModal(false);
      setEditing(null);
      setForm(emptyForm);
      loadItems();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleEdit = (item) => {
    setEditing(item._id);
    setForm({
      ...item,
      expiresAt: item.expiresAt ? item.expiresAt.substring(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this protocol?')) {
      try {
        await api.deleteCoupon(id);
        loadItems();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const activeSearch = searchParams.get('q') || search;
  const filteredItems = items.filter(item => {
    const matchesSearch = matchesSearchFields(item, activeSearch, [
      'code',
      'description',
      'discountType',
      'active',
    ]);
    
    const matchesFilter = 
      filter === 'All' || 
      (filter === 'Active' && item.active) || 
      (filter === 'Inactive' && !item.active);
      
    return matchesSearch && matchesFilter;
  });

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
          <h1>Coupon Management</h1>
          <p>Create and manage discount coupons, rules, and expiry dates.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaHistory /> Protocol Log
          </button>
          <button className="btn btn-primary accent-gradient" onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}>
            <FaPlus /> Initialize Protocol
          </button>
        </div>
      </header>

      {/* Tactical Metrics */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-accent-tint">
            <FaTicketAlt />
          </div>
          <div className="stat-info">
            <p>Active Protocols</p>
            <h3>{stats.active}/{stats.total}</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> Optimal Deployment
            </div>
          </div>
          <div className="stat-card-progress accent-gradient" style={{ width: '100%', height: '3px', position: 'absolute', bottom: 0, left: 0, opacity: 0.5 }} />
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-success-tint">
            <FaChartPie />
          </div>
          <div className="stat-info">
            <p>Mean Fiscal Offset</p>
            <h3>{stats.avgDiscount}%</h3>
            <div className="stat-trend positive">
              <FaShieldAlt /> Margin Protected
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>Protocol Yield</p>
              <span className="stat-value-highlight text-accent">{stats.efficiency}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar-fill accent-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.efficiency}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="stat-meta-tag">
              Real-time conversion efficiency index
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect border-primary">
          <div className="stat-icon-wrapper bg-primary-tint">
            <FaBolt />
          </div>
          <div className="stat-info">
            <p>System State</p>
            <h3 className="text-primary">STABLE</h3>
            <div className="stat-meta-tag">
              Incentive distribution active
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
              placeholder="Intercept protocol codes or descriptions..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="tab-controls">
            {['All', 'Active', 'Inactive'].map(s => (
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
                <th>Protocol Identifier</th>
                <th>Fiscal Offset</th>
                <th>Activation Threshold</th>
                <th>Expiration Sequence</th>
                <th>Status</th>
                <th className="text-right">Controls</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <AdminLoader message="Retrieving Promotional Protocols..." />
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
                      <div className="asset-profile-cell">
                        <div className="stat-icon-wrapper bg-accent-tint" style={{ width: '40px', height: '40px', fontSize: '1rem' }}>
                          <FaTag />
                        </div>
                        <div className="asset-details">
                          <span className="asset-name-text">{item.code}</span>
                          <span className="asset-meta-text">{item.description || 'No Protocol Desc'}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <span className="date-main text-success">
                          {item.discountType === 'percentage' ? `${item.discountValue}% OFF` : `₹${item.discountValue} OFF`}
                        </span>
                        <span className="date-sub">{item.discountType} OFFSET</span>
                      </div>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <span className="date-main">₹{item.minAmount || 0}</span>
                        <span className="date-sub">MIN SPEND</span>
                      </div>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <div className="date-row">
                          <FaCalendarTimes className="text-muted" style={{ fontSize: '0.8rem' }} />
                          <span className="date-main" style={{ fontSize: '0.85rem' }}>
                            {item.expiresAt ? new Date(item.expiresAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Indefinite'}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`status-pill ${item.active ? 'status-operational' : 'status-deactivated'}`}>
                        {item.active ? 'Operational' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="btn-icon-small" onClick={() => handleEdit(item)} title="Edit Protocol">
                          <FaEdit />
                        </button>
                        <button className="btn-icon-small danger" onClick={() => handleDelete(item._id)} title="Delete Protocol">
                          <FaTrash />
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
              <FaTicketAlt />
            </div>
            <h3>No Coupons Found</h3>
            <p>No coupons found for your current search filters.</p>
            <button 
              onClick={() => {setFilter('All'); updateSearch('');}}
              className="btn btn-primary" 
            >
              Reset Protocol Filters
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="modal-overlay">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="admin-modal glass-effect" 
            >
              <div className="panel-header">
                <div>
                  <h2>{editing ? 'Modify Protocol' : 'Initialize Protocol'}</h2>
                  <p>Configure the parameters for the fiscal offset sequence.</p>
                </div>
                <button className="btn-icon-small" onClick={() => setShowModal(false)}><FaTimes /></button>
              </div>
              
              <form onSubmit={handleSave} className="admin-form-grid">
                <div className="form-group grid-span-2">
                  <label className="form-label">Protocol Code</label>
                  <input 
                    required 
                    value={form.code} 
                    onChange={e => setForm({...form, code: e.target.value.toUpperCase()})} 
                    placeholder="e.g. ALPHA_VETERAN_50" 
                    className="admin-input"
                  />
                </div>
                <div className="form-group grid-span-2">
                  <label className="form-label">Tactical Description</label>
                  <input 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Describe the incentive objective..." 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Offset Type</label>
                  <select 
                    value={form.discountType} 
                    onChange={e => setForm({...form, discountType: e.target.value})}
                    className="admin-select"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="flat">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Offset Value</label>
                  <input 
                    type="number" 
                    required 
                    value={form.discountValue} 
                    onChange={e => setForm({...form, discountValue: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Activation Threshold (₹)</label>
                  <input 
                    type="number" 
                    value={form.minAmount} 
                    onChange={e => setForm({...form, minAmount: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Expiration Sequence</label>
                  <input 
                    type="date" 
                    value={form.expiresAt} 
                    onChange={e => setForm({...form, expiresAt: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-group grid-span-2">
                  <label className="form-label">Operational Status</label>
                  <select 
                    value={String(form.active)} 
                    onChange={e => setForm({...form, active: e.target.value === 'true'})}
                    className="admin-select"
                  >
                    <option value="true">Operational</option>
                    <option value="false">Deactivated</option>
                  </select>
                </div>
                <div className="form-actions grid-span-2">
                  <button type="submit" className="btn btn-primary">
                    {editing ? 'Commit Changes' : 'Initialize Protocol'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Coupons;
