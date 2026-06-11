import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, 
  FaStar, FaBoxOpen,
  FaArrowUp, FaChartPie, FaBolt, FaShieldAlt, FaHistory, FaTimes, FaPlane
} from 'react-icons/fa';
import { api } from '../../../services/api';
import { matchesSearchFields } from '../../../utils/search';
import { getFallbackImage } from '../../../utils/imageHelper';

const Packages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ 
    total: 0, 
    avgPrice: 0, 
    topRated: 0,
    turnover: 84
  });

  const emptyForm = { 
    name: '', duration: '', image: '', price: '', 
    rating: 4.5, popularity: 0, category: 'Adventure' 
  };
  const [form, setForm] = useState(emptyForm);

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.getPackages();
      const list = Array.isArray(response) ? response : Array.isArray(response?.data) ? response.data : [];
      setItems(list);
      const total = list.length;
      const avgPrice = list.length > 0 ? Math.round(list.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0) / list.length) : 0;
      const topRated = list.filter((p) => Number(p.rating || 0) >= 4.8).length;
      setStats({ total, avgPrice, topRated, turnover: 84 });
    } catch (err) {
      console.error(err);
      setError('Unable to load packages. Please check the server connection and try again.');
      setItems([]);
      setStats({ total: 0, avgPrice: 0, topRated: 0, turnover: 84 });
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

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const payload = { 
        ...form, 
        price: Number(form.price), 
        rating: Number(form.rating), 
        popularity: Number(form.popularity) 
      };
      if (editing) await api.updatePackage(editing, payload);
      else await api.createPackage(payload);
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
    setForm({ ...item });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to terminate this inventory asset?')) {
      try {
        await api.deletePackage(id);
        loadItems();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const activeSearch = searchParams.get('q') || search;
  const filteredItems = items.filter((item) =>
    matchesSearchFields(item, activeSearch, [
      'name',
      'location',
      'category',
      'duration',
      'description',
      'badge',
    ])
  );

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
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
          <h1>Manage Tour Packages</h1>
          <p>Create, edit, delete, and organize all tour packages shown on the website.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaHistory /> Audit Records
          </button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}>
            <FaPlus /> Add New Package
          </button>
        </div>
      </header>

      {/* Tactical Metrics */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper primary-gradient-bg">
              <FaBoxOpen />
            </div>
            <div className="trend-badge trend-up">
              <FaArrowUp /> Optimal
            </div>
          </div>
          <div className="stat-info">
            <p>Operational Assets</p>
            <h3>{stats.total}</h3>
            <span className="stat-subtitle">Current stock level</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper bg-success-tint">
              <FaChartPie />
            </div>
            <div className="trend-badge trend-up">
              <FaShieldAlt /> Secured
            </div>
          </div>
          <div className="stat-info">
            <p>Market Value Avg</p>
            <h3>₹{stats.avgPrice.toLocaleString()}</h3>
            <span className="stat-subtitle">Margin performance index</span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>Inventory Turnover</p>
              <span className="stat-value-highlight">{stats.turnover}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar-fill primary-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.turnover}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="stat-meta-tag">
              Real-time asset utilization index
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper bg-accent-tint">
              <FaBolt />
            </div>
          </div>
          <div className="stat-info">
            <p>Premium Tier</p>
            <h3>{stats.topRated} UNITS</h3>
            <span className="stat-subtitle">High-performance assets</span>
          </div>
        </motion.div>
      </div>

      <div className="content-card glass-effect">
        {error && (
          <div className="empty-state-container" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
            <p>{error}</p>
          </div>
        )}
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Intercept asset identities or specifications..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="tab-controls">
            <button className="tab-btn active">All Assets</button>
            <button className="tab-btn">Active</button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Asset Specification</th>
                <th>Market Velocity</th>
                <th>Valuation</th>
                <th>Intel Rating</th>
                <th className="text-right">Controls</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="skeleton-row">
                      <td colSpan="5"><div className="skeleton-line" /></td>
                    </tr>
                  ))
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
                        <div className="asset-image-wrapper">
                          <img 
                            src={item.heroImage || item.image || item.imagePool?.[0] || item.gallery?.[0] || getFallbackImage(item.name, 'package')} 
                            alt={item.name} 
                          />
                          <div className="status-indicator-dot" />
                        </div>
                        <div className="asset-details">
                          <span className="asset-name-text">{item.name}</span>
                          <span className="asset-meta-text"><FaPlane /> {item.category} • {item.duration}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="protocol-date" style={{ width: '120px' }}>
                        <div className="stat-header-row" style={{ marginBottom: '4px' }}>
                          <span className="date-sub">VELOCITY</span>
                          <span className="text-success" style={{ fontSize: '0.7rem' }}>{item.popularity}%</span>
                        </div>
                        <div className="progress-bar-container" style={{ height: '4px' }}>
                          <div className="progress-bar-fill" style={{ width: `${item.popularity}%`, background: 'var(--admin-success)' }} />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <span className="date-main">₹{item.price?.toLocaleString()}</span>
                        <span className="date-sub">BASELINE COST</span>
                      </div>
                    </td>
                    <td>
                      <div className="intel-rating">
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FaStar key={star} className={star <= item.rating ? 'star-active' : 'star-inactive'} />
                          ))}
                        </div>
                        <span className="rating-value">{item.rating}</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="btn-icon-small" onClick={() => handleEdit(item)} title="Edit Asset">
                          <FaEdit />
                        </button>
                        <button className="btn-icon-small danger" onClick={() => handleDelete(item._id)} title="Delete Asset">
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
              <FaBoxOpen />
            </div>
            <h3>No Packages Found</h3>
            <p>No packages found. Add your first tour package to get started.</p>
            <button className="btn btn-primary" onClick={() => updateSearch('')}>Reset Search</button>
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
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>{editing ? 'Modify Asset' : 'Register Asset'}</h2>
                  <p>Configure strategic specifications for the travel asset.</p>
                </div>
                <button className="btn-icon-small" onClick={() => setShowModal(false)}><FaTimes /></button>
              </div>
              
              <form onSubmit={handleSave} className="admin-form-grid">
                <div className="form-group span-2">
                  <label className="form-label">Asset Identity</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="e.g. Himalayan Tactical Expedition" 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Temporal Duration</label>
                  <input 
                    required 
                    value={form.duration} 
                    onChange={e => setForm({...form, duration: e.target.value})} 
                    placeholder="e.g. 5D/4N" 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Base Valuation (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Visual Recognition (Image URL)</label>
                  <input 
                    required 
                    value={form.image} 
                    onChange={e => setForm({...form, image: e.target.value})} 
                    className="admin-input"
                    placeholder="https://images.unsplash.com/..."
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Strategic Category</label>
                  <select 
                    value={form.category} 
                    onChange={e => setForm({...form, category: e.target.value})}
                    className="admin-select"
                  >
                    <option value="Adventure">Adventure</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Family">Family</option>
                    <option value="Honeymoon">Honeymoon</option>
                    <option value="Backpacking">Backpacking</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Quality Coefficient</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    value={form.rating} 
                    onChange={e => setForm({...form, rating: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-actions span-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editing ? 'Commit Updates' : 'Initialize Asset'}
                  </button>
                  <button type="button" className="btn btn-ghost flex-0-5" onClick={() => setShowModal(false)}>Abort</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Packages;
