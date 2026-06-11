import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEdit, FaTrash, FaPlus, FaSearch, FaBus, FaCar, FaTrain, FaPlane, FaTimes } from 'react-icons/fa';
import { transportationService } from '../../../services/transportationService';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Transportation = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState('');
  const emptyForm = { 
    mode: 'Bus', operator: '', from: '', to: '', departureTime: '', arrivalTime: '', duration: '', price: '', seats: 4, description: '', image: '', luxuryLevel: 'Standard' 
  };
  const [form, setForm] = useState(emptyForm);

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
      setError('');
      const data = await transportationService.getAll();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Unable to load transportation data. Please check server connection and try again.');
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const data = { 
        ...form, 
        price: Number(form.price),
        seats: Number(form.seats)
    };
    try {
      if (editing) {
        await transportationService.update(editing, data);
      } else {
        await transportationService.create(data);
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
      ...emptyForm,
      ...item,
      operator: item.operator || item.provider || '',
      price: item.price || item.pricePerKm || '',
      seats: item.seats || item.capacity || 4
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transport option?')) {
      try {
        await transportationService.delete(id);
        loadItems();
      } catch (err) {
        alert(err.message);
      }
    }
  };

  const getTransportIcon = (mode) => {
    switch (mode) {
      case 'Bus': return <FaBus />;
      case 'Train': return <FaTrain />;
      case 'Flight': return <FaPlane />;
      default: return <FaCar />;
    }
  };

  const filteredItems = (items || []).filter(item => {
    const activeSearch = searchParams.get('q') || search;
    return matchesSearchFields(item, activeSearch, [
      'mode',
      'type',
      'operator',
      'provider',
      'from',
      'to',
      'duration',
      'description',
      'luxuryLevel',
      'routeType',
    ]);
  });

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
      }}
      initial="hidden"
      animate="visible"
      className="admin-module"
    >
      <header className="module-header">
        <div className="module-title-section">
          <h1>Transportation Management</h1>
          <p>Manage flights, trains, buses, cabs, and bike rental inventory.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-primary" onClick={() => { setEditing(null); setForm(emptyForm); setShowModal(true); }}>
            <FaPlus /> Add Transportation
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper primary-gradient">
              <FaBus />
            </div>
            <div className="stat-badge-mini">ACTIVE FLEET</div>
          </div>
          <div className="stat-info">
            <p>Total Transport Units</p>
            <h3>{(items || []).length}</h3>
            <span className="stat-subtitle">Operational transit nodes</span>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper success-gradient">
              <FaPlane />
            </div>
          </div>
          <div className="stat-info">
            <p>Peak Capacity</p>
            <h3>{(items || []).reduce((acc, curr) => acc + (curr.seats || curr.capacity || 0), 0)}</h3>
            <span className="stat-subtitle">Total passenger throughput</span>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>Fleet Efficiency</p>
              <span className="stat-value-highlight">98.4%</span>
            </div>
            <div className="progress-bar">
              <motion.div 
                className="progress-fill success-gradient"
                initial={{ width: 0 }}
                animate={{ width: '98.4%' }}
                transition={{ duration: 1.5 }}
              />
            </div>
            <div className="stat-meta-tag">
              Fleet uptime and service availability
            </div>
          </div>
        </div>
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
              placeholder="Search transit modes or operators..." 
              value={searchParams.get('q') || search}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transit Mode</th>
                <th>Operator</th>
                <th>Route</th>
                <th>Fiscal Policy</th>
                <th className="text-right">Operations</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="5">
                      <AdminLoader message="Syncing Transport Logistics..." />
                    </td>
                  </tr>
                ) : filteredItems.map((item) => (
                  <motion.tr 
                    key={item._id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                  >
                    <td>
                      <div className="user-profile-cell">
                        <div className="user-avatar-small primary-gradient">
                          {getTransportIcon(item.mode)}
                        </div>
                        <div className="user-details">
                          <span className="user-name-text">{item.mode}</span>
                          <span className="user-email-text">{item.luxuryLevel}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="date-main">{item.operator || item.provider || 'Unknown'}</span>
                    </td>
                    <td>
                      <div className="protocol-date">
                        <span className="date-main">{item.from || '?'} → {item.to || '?'}</span>
                        <span className="date-sub">{item.duration || 'N/A'}</span>
                      </div>
                    </td>
                    <td>
                      <div className="value-cell success-text">₹{(item.price || item.pricePerKm || 0).toLocaleString()}</div>
                    </td>
                    <td className="text-right">
                      <div className="table-actions">
                        <button className="btn-icon-small" onClick={() => handleEdit(item)} title="Modify Parameters">
                          <FaEdit size={14} />
                        </button>
                        <button className="btn-icon-small danger" onClick={() => handleDelete(item._id)} title="Decommission Unit">
                          <FaTrash size={14} />
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
              <FaBus />
            </div>
            <h3>No Transportation Found</h3>
            <p>No transportation records found. Add your first transport option to get started.</p>
            <button 
              onClick={() => updateSearch('')}
              className="btn btn-primary"
            >
              Reset Search
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
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div className="modal-header">
                <div className="modal-title-section">
                  <h2>{editing ? 'Modify Transit Asset' : 'Provision New Asset'}</h2>
                  <p>Update logistics parameters and provider configuration</p>
                </div>
                <button className="btn-icon-small" onClick={() => setShowModal(false)}>
                  <FaTimes />
                </button>
              </div>

              <form onSubmit={handleSave} className="admin-form-grid">
                <div className="form-group">
                  <label className="form-label">Protocol Mode</label>
                  <select className="admin-select" value={form.mode} onChange={e => setForm({...form, mode: e.target.value})}>
                    <option>Flight</option>
                    <option>Train</option>
                    <option>Cab</option>
                    <option>Car Rental</option>
                    <option>Bus</option>
                    <option>Luxury Coach</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Operator</label>
                  <input className="admin-input" required value={form.operator} onChange={e => setForm({...form, operator: e.target.value})} placeholder="Indigo, Uber, Railways" />
                </div>
                <div className="form-group">
                  <label className="form-label">From</label>
                  <input className="admin-input" required value={form.from} onChange={e => setForm({...form, from: e.target.value})} placeholder="Origin City" />
                </div>
                <div className="form-group">
                  <label className="form-label">To</label>
                  <input className="admin-input" required value={form.to} onChange={e => setForm({...form, to: e.target.value})} placeholder="Destination City" />
                </div>
                <div className="form-group">
                  <label className="form-label">Departure Time</label>
                  <input className="admin-input" required value={form.departureTime} onChange={e => setForm({...form, departureTime: e.target.value})} placeholder="10:00 AM" />
                </div>
                <div className="form-group">
                  <label className="form-label">Arrival Time</label>
                  <input className="admin-input" required value={form.arrivalTime} onChange={e => setForm({...form, arrivalTime: e.target.value})} placeholder="12:00 PM" />
                </div>
                <div className="form-group">
                  <label className="form-label">Duration</label>
                  <input className="admin-input" required value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} placeholder="2h 00m" />
                </div>
                <div className="form-group">
                  <label className="form-label">Fiscal Policy (Price)</label>
                  <input className="admin-input" type="number" required value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Seats Capacity</label>
                  <input className="admin-input" type="number" required value={form.seats} onChange={e => setForm({...form, seats: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Luxury Level</label>
                  <select className="admin-select" value={form.luxuryLevel} onChange={e => setForm({...form, luxuryLevel: e.target.value})}>
                    <option>Standard</option>
                    <option>Premium</option>
                    <option>Luxury</option>
                    <option>Ultra Luxury</option>
                  </select>
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Operational Brief</label>
                  <textarea className="admin-textarea" rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe transit specifics..." />
                </div>
                <div className="form-group span-2">
                  <label className="form-label">Visual Identification (URL)</label>
                  <input className="admin-input" value={form.image} onChange={e => setForm({...form, image: e.target.value})} placeholder="https://assets.klicktour.com/transport/..." />
                </div>
                
                <div className="form-actions span-2">
                  <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                    Abort
                  </button>
                  <button type="submit" className="btn btn-primary">
                    {editing ? 'Update Registry' : 'Confirm Provisioning'}
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

export default Transportation;
