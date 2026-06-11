import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaEnvelope, FaEnvelopeOpen, FaSearch, FaTrash, FaCheck, 
  FaReply, FaUser, FaClock, FaFilter, FaStar, FaHistory,
  FaSignal, FaGlobeAmericas, FaBolt, FaTimes
} from 'react-icons/fa';
import { api } from '../../../services/api';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Messages = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [filter, setFilter] = useState('All');

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
      const data = await api.getContacts();
      setItems(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const markRead = async (id) => {
    try {
      await api.markContactRead(id);
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
      'subject',
      'message',
      'status',
    ]);
    
    const matchesFilter = 
      filter === 'All' || 
      (filter === 'Unread' && !item.read) || 
      (filter === 'Read' && item.read);
    
    return matchesSearch && matchesFilter;
  });

  const unreadCount = items.filter(i => !i.read).length;

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
          <h1>Message Management</h1>
          <p>Review customer inquiries and track read and unresolved messages.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect" onClick={loadItems}>
            <FaHistory /> Sync Uplink
          </button>
        </div>
      </header>

      {/* Signal Stats */}
      <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-icon-wrapper bg-primary-tint">
            <FaSignal />
          </div>
          <div className="stat-info">
            <p>Total Signal Intercepts</p>
            <h3>{items.length}</h3>
            <span className="stat-subtitle">
              <FaGlobeAmericas size={10} /> Worldwide Coverage
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className={`stat-card glass-effect ${unreadCount > 0 ? 'border-danger' : ''}`}>
          <div className={`stat-icon-wrapper ${unreadCount > 0 ? 'bg-danger-tint' : 'bg-success-tint'}`}>
            {unreadCount > 0 ? <FaEnvelope /> : <FaCheck />}
          </div>
          <div className="stat-info">
            <p>Unresolved Nodes</p>
            <h3 className={unreadCount > 0 ? 'text-danger' : 'text-success'}>{unreadCount}</h3>
            <span className="stat-subtitle">
              Action required on {unreadCount} intercepts
            </span>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="stat-card glass-effect">
          <div className="stat-info full-width">
            <div className="stat-header-row">
              <p>Response Velocity</p>
              <span className="text-success">2.4h</span>
            </div>
            <div className="progress-bar-container">
              <motion.div 
                className="progress-bar-fill success-gradient"
                initial={{ width: 0 }}
                animate={{ width: '85%' }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
            <div className="stat-meta-tag">
              <FaBolt size={10} className="text-warning" /> High-priority resolution active
            </div>
          </div>
        </motion.div>
      </div>

      <div className="content-card glass-effect" style={{ borderRadius: '28px', padding: '2.5rem' }}>
        <div className="filters-bar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', gap: '2rem' }}>
          <div className="search-box" style={{ flex: 1, position: 'relative', maxWidth: '500px' }}>
            <FaSearch style={{ position: 'absolute', left: '20px', top: '50%', transform: 'translateY(-50%)', color: 'var(--admin-text-muted)', fontSize: '1.1rem', opacity: 0.5 }} />
            <input 
              type="text" 
              placeholder="Search principals, signals or subject identifiers..." 
              value={activeSearch}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
              style={{ width: '100%', padding: '16px 16px 16px 4rem', borderRadius: '18px', background: 'rgba(255,255,255,0.02)' }}
            />
          </div>
          <div className="filter-tabs" style={{ display: 'flex', background: 'rgba(255,255,255,0.03)', padding: '6px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)' }}>
            {['All', 'Unread', 'Read'].map(f => (
              <button 
                key={f}
                className={`tab-btn ${filter === f ? 'active' : ''}`}
                onClick={() => setFilter(f)}
                style={{ 
                  padding: '10px 24px', 
                  borderRadius: '12px', 
                  fontSize: '0.85rem', 
                  fontWeight: 700,
                  background: filter === f ? 'var(--admin-primary)' : 'transparent',
                  color: filter === f ? 'white' : 'var(--admin-text-muted)',
                  border: 'none',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'pointer'
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}></th>
                <th style={{ width: '30%' }}>Signal Origin</th>
                <th>Subject Header</th>
                <th>Transmission Log</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Controls</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {loading ? (
                  <tr>
                    <td colSpan="6">
                      <AdminLoader message="Decoding Encrypted Signals..." />
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
                    onClick={() => setSelectedMessage(item)} 
                    style={{ 
                      background: !item.read ? 'rgba(56, 189, 248, 0.04)' : 'rgba(255,255,255,0.015)',
                      cursor: 'pointer'
                    }}
                  >
                    <td>
                      {item.read ? 
                        <FaEnvelopeOpen style={{ color: '#64748b', opacity: 0.5 }} /> : 
                        <motion.div 
                          animate={{ scale: [1, 1.2, 1] }} 
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <FaEnvelope style={{ color: 'var(--admin-primary)' }} />
                        </motion.div>
                      }
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '44px', 
                          height: '44px', 
                          borderRadius: '12px', 
                          background: 'var(--admin-primary-gradient)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          fontWeight: 800, 
                          color: 'white',
                          fontSize: '1.1rem',
                          boxShadow: '0 8px 16px -4px rgba(56, 189, 248, 0.4)'
                        }}>
                          {item.name?.charAt(0).toUpperCase()}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontWeight: !item.read ? 800 : 600, color: '#f8fafc', fontSize: '1rem' }}>{item.name}</span>
                          <span style={{ fontSize: '0.8rem', color: '#64748b', letterSpacing: '0.2px' }}>{item.email}</span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontWeight: !item.read ? 700 : 400, color: '#e2e8f0', fontSize: '0.95rem' }}>{item.subject}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <span style={{ color: '#cbd5e1', fontSize: '0.9rem', fontWeight: 600 }}>
                          {new Date(item.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#475569', letterSpacing: '0.5px' }}>INTERCEPTED</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ 
                        padding: '6px 16px', 
                        borderRadius: '12px', 
                        fontSize: '0.7rem',
                        fontWeight: 900,
                        textTransform: 'uppercase',
                        letterSpacing: '1px',
                        background: item.read ? 'rgba(148, 163, 184, 0.08)' : 'rgba(56, 189, 248, 0.12)',
                        color: item.read ? '#94a3b8' : 'var(--admin-primary)',
                        border: `1px solid ${item.read ? 'rgba(148, 163, 184, 0.1)' : 'rgba(56, 189, 248, 0.2)'}`,
                        display: 'inline-block'
                      }}>
                        {item.read ? 'RESOLVED' : 'UNRESOLVED'}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }} onClick={e => e.stopPropagation()}>
                        {!item.read && (
                          <motion.button 
                            whileHover={{ scale: 1.1, backgroundColor: 'rgba(56, 189, 248, 0.2)' }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => markRead(item._id)}
                            style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--admin-primary)', border: '1px solid rgba(56, 189, 248, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <FaCheck size={14} />
                          </motion.button>
                        )}
                        <motion.button 
                          whileHover={{ scale: 1.1, backgroundColor: 'rgba(248, 113, 113, 0.2)' }}
                          whileTap={{ scale: 0.95 }}
                          style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(248, 113, 113, 0.1)', color: '#f87171', border: '1px solid rgba(248, 113, 113, 0.2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                          <FaTrash size={14} />
                        </motion.button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {!loading && filteredItems.length === 0 && (
          <div style={{ padding: '8rem 2rem', textAlign: 'center' }}>
            <div style={{ background: 'rgba(255,255,255,0.02)', width: '100px', height: '100px', borderRadius: '35px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem', border: '1px solid rgba(255,255,255,0.05)' }}>
              <FaEnvelopeOpen style={{ fontSize: '3.5rem', color: '#475569', opacity: 0.3 }} />
            </div>
            <h3 style={{ color: 'white', fontSize: '1.8rem', fontWeight: 800, marginBottom: '12px', letterSpacing: '-0.5px' }}>Nexus Quiet</h3>
            <p style={{ color: '#64748b', maxWidth: '450px', margin: '0 auto', fontSize: '1rem', lineHeight: 1.6 }}>No signal intercepts detected matching your current filtering parameters.</p>
            <button 
              onClick={() => {setFilter('All'); updateSearch('');}}
              className="btn btn-primary" 
              style={{ marginTop: '2.5rem', padding: '12px 32px', borderRadius: '14px', fontWeight: 700 }}
            >
              Reset Protocols
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedMessage && (
          <div className="modal-overlay" style={{ position: 'fixed', inset: 0, background: 'rgba(2, 6, 23, 0.85)', backdropFilter: 'blur(12px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="glass-effect" 
              style={{ padding: '3rem', borderRadius: '32px', width: '100%', maxWidth: '750px', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <div style={{ width: '70px', height: '70px', borderRadius: '20px', background: 'var(--admin-primary-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', boxShadow: '0 10px 20px -5px rgba(56, 189, 248, 0.4)' }}>
                    <FaUser color="white" />
                  </div>
                  <div>
                    <h2 style={{ fontSize: '1.8rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{selectedMessage.subject}</h2>
                    <p style={{ color: 'var(--admin-text-muted)', marginTop: '6px' }}>
                      From: <span style={{ color: '#f8fafc', fontWeight: 700 }}>{selectedMessage.name}</span> 
                      <span style={{ fontSize: '0.85rem', marginLeft: '8px', opacity: 0.7 }}>&lt;{selectedMessage.email}&gt;</span>
                    </p>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedMessage(null)}
                  style={{ width: '44px', height: '44px', borderRadius: '14px', background: 'rgba(255,255,255,0.03)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <FaTimes size={18} />
                </button>
              </div>
              
              <div style={{ 
                background: 'rgba(15, 23, 42, 0.4)', 
                padding: '2.5rem', 
                borderRadius: '24px', 
                border: '1px solid rgba(255,255,255,0.05)', 
                minHeight: '220px', 
                maxHeight: '45vh',
                overflowY: 'auto',
                whiteSpace: 'pre-wrap', 
                color: '#e2e8f0',
                lineHeight: '1.8',
                fontSize: '1.1rem',
                boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.1)'
              }}>
                {selectedMessage.message}
              </div>

              <div style={{ display: 'flex', gap: '1.5rem', marginTop: '3rem' }}>
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-primary" 
                  style={{ flex: 2, padding: '18px', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.5px' }} 
                  onClick={() => alert('Uplink restricted: Manual reply required via standard protocol.')}
                >
                  <FaReply /> ESTABLISH UPLINK
                </motion.button>
                {!selectedMessage.read && (
                    <motion.button 
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="btn glass-effect" 
                      style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: 700 }} 
                      onClick={() => { markRead(selectedMessage._id); setSelectedMessage(null); }}
                    >
                        RESOLVE SIGNAL
                    </motion.button>
                )}
                <motion.button 
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn glass-effect" 
                  style={{ flex: 1, padding: '18px', borderRadius: '16px', fontWeight: 700 }} 
                  onClick={() => setSelectedMessage(null)}
                >
                    ABORT
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Messages;
