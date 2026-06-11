import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaFilter, 
  FaStar, FaMapMarkerAlt, FaGlobe, FaMountain,
  FaArrowUp, FaChartPie, FaBolt, FaShieldAlt, FaHistory, FaTimes, FaLayerGroup, FaSatellite, FaEllipsisV
} from 'react-icons/fa';
import { api } from '../../../services/api';
import { matchesSearchFields } from '../../../utils/search';
import { getFallbackImage } from '../../../utils/imageHelper';

const Destinations = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const emptyForm = { name: '', type: 'Adventure', budget: 'Medium', duration: '', price: '', description: '', images: '' };
  const [form, setForm] = useState(emptyForm);
  const [stats, setStats] = useState({
    totalNodes: 0,
    activeSectors: 0,
    avgFiscal: 0,
    deploymentReady: 98
  });

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getDestinations();
      setItems(data);
      
      const totalNodes = data.length;
      const activeSectors = [...new Set(data.map(i => i.type))].length;
      const avgFiscal = data.length > 0 ? Math.round(data.reduce((a, b) => a + (Number(b.price) || 0), 0) / data.length) : 0;
      
      setStats({
        totalNodes,
        activeSectors,
        avgFiscal,
        deploymentReady: 98
      });
    } catch (err) {
      console.error('Failed to load destinations:', err);
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
    const data = { 
        ...form, 
        price: Number(form.price), 
        images: typeof form.images === 'string' ? form.images.split(',').map(s => s.trim()).filter(Boolean) : form.images 
    };
    try {
      if (editing) {
        await api.updateDestination(editing, data);
      } else {
        await api.createDestination(data);
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
        images: (item.images || []).join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to terminate this destination node?')) {
      try {
        await api.deleteDestination(id);
        loadItems();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const activeSearch = searchParams.get('q') || search;
  const filteredItems = items.filter(item => 
    matchesSearchFields(item, activeSearch, [
      'name',
      'title',
      'location',
      'type',
      'category',
      'budget',
      'description',
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
          <h1>Destination Management</h1>
          <p>Add, update, and organize destinations by category, budget, and duration.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaHistory /> Audit Records
          </button>
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}>
            <FaPlus /> Initialize Node
          </button>
        </div>
      </header>

      {/* Tactical Metrics */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-primary-tint">
            <FaMapMarkerAlt />
          </div>
          <div className="stat-info">
            <p>Total Nodes</p>
            <h3>{stats.totalNodes}</h3>
            <div className="stat-badge-mini">Sector Alpha-9</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-accent-tint">
            <FaLayerGroup />
          </div>
          <div className="stat-info">
            <p>Active Sectors</p>
            <h3>{stats.activeSectors}</h3>
            <div className="stat-badge-mini">Perimeter Secure</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>Sync Readiness</p>
              <span className="stat-value-highlight">{stats.deploymentReady}%</span>
            </div>
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar-fill primary-gradient"
                initial={{ width: 0 }}
                animate={{ width: `${stats.deploymentReady}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
              />
            </div>
            <div className="stat-meta-tag">
              <FaSatellite /> Global node synchronization active
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect border-success">
          <div className="stat-icon-wrapper bg-success-tint">
            <FaBolt />
          </div>
          <div className="stat-info">
            <p>Mean Fiscal Baseline</p>
            <h3 className="text-success">₹{stats.avgFiscal.toLocaleString()}</h3>
            <div className="stat-badge-mini">Resource Efficient</div>
          </div>
        </motion.div>
      </div>

      <div className="content-card glass-effect">
        <div className="filters-bar">
          <div className="search-box flex-1">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Intercept node identifiers or mission sectors..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="filter-actions">
            <button className="action-btn"><FaFilter /></button>
            <div className="tab-controls">
              <button className="tab-btn active">All Nodes</button>
              <button className="tab-btn">Operational</button>
            </div>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Asset Designation</th>
                <th>Operational Sector</th>
                <th>Temporal Window</th>
                <th>Fiscal Baseline</th>
                <th>Intel Rating</th>
                <th className="text-right">Controls</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={`skeleton-${i}`} className="skeleton-row">
                      <td colSpan="6"><div className="skeleton-line" /></td>
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
                            src={item.heroImage || item.images?.[0] || item.imagePool?.[0] || getFallbackImage(item.name, 'destination')} 
                            alt={item.name} 
                          />
                          <div className="status-indicator-dot" />
                        </div>
                        <div className="asset-details">
                          <span className="asset-name-text">{item.name}</span>
                          <span className="asset-meta-text"><FaGlobe /> Global Alpha</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-active">
                        <FaMountain /> {item.type}
                      </span>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <span className="date-main">{item.duration || 'Variable'}</span>
                        <span className="date-sub">MISSION LENGTH</span>
                      </div>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <span className="date-main text-success">₹{item.price?.toLocaleString()}</span>
                        <span className="date-sub">UNIT COST</span>
                      </div>
                    </td>
                    <td>
                      <div className="intel-rating">
                        <div className="rating-stars">
                          {[1, 2, 3, 4, 5].map(star => (
                            <FaStar key={star} className={star <= 4 ? 'star-active' : 'star-inactive'} />
                          ))}
                        </div>
                        <span className="rating-value">4.8</span>
                      </div>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="btn-icon-small" onClick={() => handleEdit(item)} title="Edit Node">
                          <FaEdit />
                        </button>
                        <button className="btn-icon-small danger" onClick={() => handleDelete(item._id)} title="Terminate Node">
                          <FaTrash />
                        </button>
                        <button className="btn-icon-small" title="More Intel">
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
              <FaSatellite />
            </div>
            <h3>No Destinations Found</h3>
            <p>No destinations found. Add your first destination to get started.</p>
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
                  <h2>{editing ? 'Modify Node' : 'Initialize Vector'}</h2>
                  <p>Configure strategic parameters for the destination node.</p>
                </div>
                <button className="action-btn" onClick={() => setShowModal(false)}><FaTimes /></button>
              </div>
              
              <form onSubmit={handleSave} className="admin-form-grid">
                <div className="form-group span-2">
                  <label className="form-label">Asset Designation</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="e.g. Neo-Tokyo Sector 7" 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Operational Sector</label>
                  <select 
                    value={form.type} 
                    onChange={e => setForm({...form, type: e.target.value})}
                    className="admin-select"
                  >
                    <option>Adventure</option>
                    <option>Family</option>
                    <option>Luxury</option>
                    <option>Nature</option>
                    <option>Honeymoon</option>
                    <option>Culture</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Priority</label>
                  <select 
                    value={form.budget} 
                    onChange={e => setForm({...form, budget: e.target.value})}
                    className="admin-select"
                  >
                    <option>Low</option>
                    <option>Medium</option>
                    <option>High</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Temporal Window</label>
                  <input 
                    required 
                    value={form.duration} 
                    onChange={e => setForm({...form, duration: e.target.value})} 
                    placeholder="e.g. 5 Cycles" 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Fiscal Baseline (₹)</label>
                  <input 
                    type="number" 
                    required 
                    value={form.price} 
                    onChange={e => setForm({...form, price: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Mission Briefing</label>
                  <textarea 
                    required 
                    rows="4" 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    className="admin-textarea"
                    placeholder="Describe strategic advantages..."
                  />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Visual Reconnaissance (URLs)</label>
                  <input 
                    value={form.images} 
                    onChange={e => setForm({...form, images: e.target.value})} 
                    placeholder="https://intel-sat-1.jpg, https://intel-sat-2.jpg" 
                    className="admin-input"
                  />
                </div>
                <div className="form-actions span-2">
                  <button type="submit" className="btn btn-primary flex-1">
                    {editing ? 'Commit Updates' : 'Initialize Node'}
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

export default Destinations;
