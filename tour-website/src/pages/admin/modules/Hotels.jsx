import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEdit, FaTrash, FaPlus, FaSearch, FaHotel, FaStar, 
  FaMapMarkerAlt, FaSwimmingPool, FaWifi, FaParking, FaCoffee, 
  FaChartBar, FaShieldAlt, FaHistory, FaFilter, FaTimes, FaCamera,
  FaArrowUp, FaCheckCircle
} from 'react-icons/fa';
import { hotelService } from '../../../services/hotelService';
import AdminLoader from '../components/AdminLoader';
import SelfHealingImage from '../../../components/common/SelfHealingImage';
import { matchesSearchFields } from '../../../utils/search';
import { getFallbackImage } from '../../../utils/imageHelper';

const Hotels = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    avgRating: 0,
    locations: 0,
    occupancy: 78
  });

  const emptyForm = { name: '', location: '', pricePerNight: '', rating: 4, amenities: '', images: '', description: '' };
  const [form, setForm] = useState(emptyForm);

  const getHotelId = (item) => item?._id || item?.id;

  const getCityFromLocation = (location = '') => {
    const [city] = String(location).split(',');
    return city.trim() || String(location).trim() || 'Unknown';
  };

  const loadItems = useCallback(async () => {
    try {
      setLoading(true);
      const data = await hotelService.getHotels();
      setItems(data);
      
      const total = data.length;
      const avgRating = data.length > 0 ? (data.reduce((acc, curr) => acc + (curr.rating || 0), 0) / data.length).toFixed(1) : 0;
      const locations = new Set(data.map(h => h.location)).size;
      
      setStats(prev => ({ ...prev, total, avgRating, locations }));
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

  const handleSave = async (e) => {
    e.preventDefault();
    const images = typeof form.images === 'string'
      ? form.images.split(',').map(s => s.trim()).filter(Boolean)
      : form.images || [];
    const amenities = typeof form.amenities === 'string'
      ? form.amenities.split(',').map(s => s.trim()).filter(Boolean)
      : form.amenities || [];

    const payload = { 
        name: form.name,
        city: form.city || getCityFromLocation(form.location),
        location: form.location,
        price: Number(form.pricePerNight),
        rating: Number(form.rating),
        amenities,
        image: images[0] || form.image || '',
        images,
        gallery: images,
        description: form.description,
    };
    try {
      if (editing) {
        await hotelService.updateHotel(editing, payload);
      } else {
        await hotelService.createHotel(payload);
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
    setEditing(getHotelId(item));
    const images = item.images?.length ? item.images : [item.image].filter(Boolean);
    setForm({ 
        name: item.name || '',
        city: item.city || getCityFromLocation(item.location),
        location: item.location || item.city || '',
        pricePerNight: item.pricePerNight || item.price || '',
        rating: item.rating || 4,
        description: item.description || '',
        image: item.image || images[0] || '',
        amenities: (item.amenities || []).join(', '),
        images: images.join(', ')
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to decommission this property asset?')) {
      try {
        await hotelService.deleteHotel(id);
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
      'location',
      'city',
      'description',
      'rating',
      (row) => (row.amenities || []).join(' '),
      (row) => row.pricePerNight || row.price,
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
          <h1>Hotel Management</h1>
          <p>Add and update hotel listings, pricing, ratings, and amenities.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaHistory /> Asset Audit
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}
          >
            <FaPlus /> Deploy Asset
          </button>
        </div>
      </header>

      {/* Stats Summary */}
      <div className="stats-grid">
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-primary-tint">
            <FaHotel />
          </div>
          <div className="stat-info">
            <p>Total Registered Assets</p>
            <h3>{stats.total}</h3>
            <div className="stat-trend positive">
              <FaArrowUp /> Active Units
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-warning-tint">
            <FaStar />
          </div>
          <div className="stat-info">
            <p>Global Rating Index</p>
            <h3>{stats.avgRating} <span style={{ fontSize: '1rem', opacity: 0.7 }}>★</span></h3>
            <div className="stat-badge-mini">Verified Benchmark</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-success-tint">
            <FaMapMarkerAlt />
          </div>
          <div className="stat-info">
            <p>Deployment Sectors</p>
            <h3>{stats.locations}</h3>
            <div className="stat-meta-tag">Strategic Regions</div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-accent-tint">
            <FaShieldAlt />
          </div>
          <div className="stat-info">
            <p>Asset Integrity</p>
            <h3>{stats.occupancy}%</h3>
            <div className="progress-bar-container mini">
              <div className="progress-bar-fill accent-gradient" style={{ width: `${stats.occupancy}%` }} />
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
              placeholder="Search assets by name, sector or location..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
          <div className="tab-controls">
            <button className="btn btn-ghost glass-effect">
              <FaFilter /> Sector Protocols
            </button>
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '35%' }}>Asset Identifier</th>
                <th>Operational Location</th>
                <th>Valuation/Night</th>
                <th>System Status</th>
                <th className="text-right">Controls</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="5">
                      <AdminLoader message="Scanning Hospitality Assets..." />
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
                        <div className="asset-image">
                          <SelfHealingImage
                            src={item.heroImage || item.image || item.images?.[0] || item.imagePool?.[0] || getFallbackImage(item.name, 'hotel')}
                            alt={`${item.name || 'Hotel'} | ${item.location || item.city || ''}`}
                            entityId={getHotelId(item)}
                            type="hotel"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="asset-info">
                          <span className="asset-name-text">{item.name}</span>
                          <div className="asset-meta-text">
                            {item.amenities?.slice(0, 3).map((a, i) => (
                              <span key={i} title={a} style={{ color: 'var(--admin-primary)' }}>
                                {a.toLowerCase().includes('wifi') && <FaWifi />}
                                {a.toLowerCase().includes('pool') && <FaSwimmingPool />}
                                {a.toLowerCase().includes('park') && <FaParking />}
                                {a.toLowerCase().includes('break') && <FaCoffee />}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="date-cell">
                        <span className="date-main">
                          <FaMapMarkerAlt style={{ color: 'var(--admin-danger)', marginRight: '6px' }} />
                          {item.location}
                        </span>
                        <span className="date-sub">Sector Deployment</span>
                      </div>
                    </td>
                    <td>
                      <div className="value-cell">
                        ₹{item.pricePerNight?.toLocaleString()}
                        <span className="value-unit">/night</span>
                      </div>
                    </td>
                    <td>
                      <span className="status-pill status-active">
                        <FaStar size={10} />
                        {item.rating} Index
                      </span>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="btn-icon-small" onClick={() => handleEdit(item)} title="Edit Asset">
                          <FaEdit />
                        </button>
                        <button className="btn-icon-small danger" onClick={() => handleDelete(getHotelId(item))} title="Decommission Asset">
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
              <FaHotel />
            </div>
            <h3>No Hotels Found</h3>
            <p>No hotel listings found. Add your first hotel listing to get started.</p>
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
              <div className="panel-header">
                <div>
                  <h2>{editing ? 'Modify Asset' : 'Register Asset'}</h2>
                  <p>Update property specifications and operational parameters.</p>
                </div>
                <button className="btn-icon-small" onClick={() => setShowModal(false)}><FaTimes /></button>
              </div>

              <form onSubmit={handleSave} className="admin-form-grid">
                <div className="form-group grid-span-2">
                  <label className="form-label">Asset Designation</label>
                  <input 
                    required 
                    value={form.name} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    className="admin-input"
                    placeholder="e.g. Grand Tactical Resort"
                  />
                </div>
                <div className="form-group grid-span-2">
                  <label className="form-label">Operational Sector (Location)</label>
                  <div className="input-with-icon">
                    <FaMapMarkerAlt className="input-icon" />
                    <input 
                      required 
                      value={form.location} 
                      onChange={e => setForm({...form, location: e.target.value})} 
                      className="admin-input"
                      placeholder="e.g. Goa Sector Alpha"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Fiscal Baseline (₹/Night)</label>
                  <input 
                    type="number" 
                    required 
                    value={form.pricePerNight} 
                    onChange={e => setForm({...form, pricePerNight: e.target.value})} 
                    className="admin-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Quality Index (1-5)</label>
                  <div className="input-with-icon">
                    <FaStar className="input-icon" />
                    <input 
                      type="number" 
                      step="0.1" 
                      min="1" 
                      max="5" 
                      required 
                      value={form.rating} 
                      onChange={e => setForm({...form, rating: e.target.value})} 
                      className="admin-input"
                    />
                  </div>
                </div>
                <div className="form-group grid-span-2">
                  <label className="form-label">Operational Capabilities (Amenities)</label>
                  <input 
                    className="admin-input" 
                    value={form.amenities} 
                    onChange={e => setForm({...form, amenities: e.target.value})} 
                    placeholder="WiFi, Pool, Breakfast, Tactical Parking" 
                  />
                </div>
                <div className="form-group grid-span-2">
                  <label className="form-label">Visual Assets (URLs)</label>
                  <div className="input-with-icon">
                    <FaCamera className="input-icon" />
                    <input 
                      className="admin-input" 
                      value={form.images} 
                      onChange={e => setForm({...form, images: e.target.value})} 
                      placeholder="url1, url2, url3" 
                    />
                  </div>
                </div>
                <div className="form-actions grid-span-2">
                  <button type="submit" className="btn btn-primary">
                    {editing ? 'COMMIT UPDATES' : 'INITIALIZE ASSET'}
                  </button>
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                    ABORT
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Hotels;
