import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaCreditCard, FaSearch, FaFilter, FaDownload, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import '../ModernAdmin.css';
import AdminLoader from '../components/AdminLoader';
import { matchesSearchFields } from '../../../utils/search';

const Payments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('q') || '');

  // Mock data for payments
  useEffect(() => {
    setTimeout(() => {
      setPayments([
        { id: 'TRX-9821', user: 'John Doe', amount: 1250.00, status: 'Completed', method: 'Stripe', date: '2024-03-20', type: 'Credit' },
        { id: 'TRX-9822', user: 'Jane Smith', amount: 850.00, status: 'Pending', method: 'PayPal', date: '2024-03-21', type: 'Credit' },
        { id: 'TRX-9823', user: 'Robert Johnson', amount: 2100.00, status: 'Completed', method: 'Bank Transfer', date: '2024-03-19', type: 'Credit' },
        { id: 'TRX-9824', user: 'Alice Williams', amount: 450.00, status: 'Failed', method: 'Stripe', date: '2024-03-18', type: 'Refund' },
        { id: 'TRX-9825', user: 'Michael Brown', amount: 1500.00, status: 'Completed', method: 'Stripe', date: '2024-03-17', type: 'Credit' },
        { id: 'TRX-9826', user: 'Emily Davis', amount: 300.00, status: 'Completed', method: 'Stripe', date: '2024-03-16', type: 'Credit' },
      ]);
      setLoading(false);
    }, 800);
  }, []);

  const updateSearch = (value) => {
    setSearchTerm(value);
    const nextParams = new URLSearchParams(searchParams);
    if (value.trim()) nextParams.set('q', value);
    else nextParams.delete('q');
    setSearchParams(nextParams, { replace: true });
  };

  const activeSearchTerm = searchParams.get('q') || searchTerm;

  const filteredPayments = payments.filter(p => 
    matchesSearchFields(p, activeSearchTerm, [
      'user',
      'id',
      'method',
      'status',
      'type',
      'date',
    ])
  );

  if (loading) return <div className="admin-loading">Loading Transaction Logs...</div>;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="admin-module"
    >
      <header className="module-header">
        <div className="module-title-section">
          <h1>Payment Management</h1>
          <p>Monitor transactions, refunds, and payment status across bookings.</p>
        </div>
        <div className="module-actions">
          <button className="btn btn-ghost glass-effect">
            <FaFilter /> Advanced Filter
          </button>
          <button className="btn btn-primary">
            <FaDownload /> Export Ledger
          </button>
        </div>
      </header>

      <div className="stats-grid">
        <div className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper success-gradient" style={{ color: '#030712' }}>
              <FaArrowUp />
            </div>
            <div className="trend-badge trend-up">
              +12.5% <FaArrowUp size={10} />
            </div>
          </div>
          <div className="stat-info">
            <p>Total Revenue</p>
            <h3>$45,250.00</h3>
            <span className="stat-subtitle">Net realized capital</span>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper danger-gradient" style={{ color: '#030712' }}>
              <FaArrowDown />
            </div>
            <div className="trend-badge trend-down">
              -2.4% <FaArrowDown size={10} />
            </div>
          </div>
          <div className="stat-info">
            <p>Total Refunds</p>
            <h3>$1,450.00</h3>
            <span className="stat-subtitle">Authorized capital reversal</span>
          </div>
        </div>

        <div className="stat-card glass-effect">
          <div className="stat-header">
            <div className="stat-icon-wrapper primary-gradient" style={{ color: '#030712' }}>
              <FaCreditCard />
            </div>
          </div>
          <div className="stat-info">
            <p>Active Payouts</p>
            <h3>$8,200.00</h3>
            <span className="stat-subtitle">Scheduled: 01 APR 2024</span>
          </div>
        </div>
      </div>

      <div className="content-card glass-effect">
        <div className="filters-bar">
          <div className="search-box">
            <FaSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Search by User or Transaction ID..." 
              value={activeSearchTerm}
              onChange={(e) => updateSearch(e.target.value)}
              className="admin-input"
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Transaction ID</th>
                <th>Principal</th>
                <th>Value</th>
                <th>Protocol</th>
                <th>Timestamp</th>
                <th>Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7">
                    <AdminLoader message="Auditing Financial Transactions..." />
                  </td>
                </tr>
              ) : filteredPayments.map((payment) => (
                <tr key={payment.id}>
                  <td>
                    <span className="date-main" style={{ color: 'var(--admin-primary)' }}>{payment.id}</span>
                  </td>
                  <td>
                    <div className="user-cell">
                      <div className="user-info-small">
                        <div className="name">{payment.user}</div>
                        <div className="id">VERIFIED PRINCIPAL</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="value-cell">
                      ${payment.amount.toFixed(2)}
                    </div>
                  </td>
                  <td>
                    <div className="stat-badge-mini">{payment.method}</div>
                  </td>
                  <td>
                    <div className="protocol-date">
                      <span className="date-main">{payment.date}</span>
                      <span className="date-sub">UTC-0 LOG</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-pill ${
                      payment.status === 'Completed' ? 'status-active' : 
                      payment.status === 'Pending' ? 'status-pending' : 'status-danger'
                    }`}>
                      {payment.status}
                    </span>
                  </td>
                  <td className="text-right">
                    <button className="btn-icon-small" title="View Details">
                      <FaCreditCard size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
};

export default Payments;
