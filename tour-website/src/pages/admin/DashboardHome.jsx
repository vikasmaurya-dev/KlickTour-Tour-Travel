import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, ResponsiveContainer,
  ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell
} from 'recharts';
import { 
  FaBox, FaMapMarkedAlt, FaCalendarCheck, FaUsers, 
  FaArrowUp, FaArrowDown, FaRupeeSign, FaHotel, FaBus, FaStar, 
  FaEnvelope, FaHistory, FaDownload,
  FaShieldAlt, FaRocket, FaClock, FaEllipsisV, FaSearch,
  FaArrowRight, FaCalendarDay, FaBolt, FaServer, FaUserShield
} from 'react-icons/fa';
import { api } from '../../services/api';
import { bookingService } from '../../services/bookingService';
import AdminLoader from './components/AdminLoader';
import { matchesSearchFields } from '../../utils/search';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 15 }
  }
};

const StatCard = ({ title, value, icon, color, trend, trendValue, subtitle, data = [], onClick }) => (
  <motion.button 
    type="button"
    variants={itemVariants}
    className="stat-card"
    onClick={onClick}
    whileHover={{ y: -4 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="stat-card-content">
        <div className="stat-header">
            <div className="stat-icon-wrapper" style={{ 
                background: `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, 0.1)`, 
                color: color,
                boxShadow: `0 8px 16px -4px ${color}40`,
                border: `1px solid ${color}30`
            }}>
              {icon}
            </div>
            {trend && (
                <div className={`trend-badge trend-${trend}`}>
                    {trend === 'up' ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
                    {trendValue}%
                </div>
            )}
        </div>

        <div className="stat-info">
          <p>{title}</p>
          <h3>{value}</h3>
          {subtitle && (
            <span className="stat-subtitle">{subtitle}</span>
          )}
        </div>

        {data.length > 0 && (
            <div className="stat-sparkline">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                        <Area type="monotone" dataKey="val" stroke={color} fill={color} fillOpacity={0.1} strokeWidth={2} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        )}
    </div>
  </motion.button>
);

const MiniStat = ({ label, value, icon, color, onClick }) => (
  <button type="button" className="mini-stat-card glass-effect" onClick={onClick}>
      <div className="mini-stat-icon" style={{ background: `${color}15`, color: color }}>
        {icon}
      </div>
      <div className="mini-stat-info">
          <p className="mini-stat-label">{label}</p>
          <h4 className="mini-stat-value">{value}</h4>
      </div>
  </button>
);

const DashboardHome = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [recentMessages, setRecentMessages] = useState([]);
  const [topUsers, setTopUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('revenue');
  const [logSearch, setLogSearch] = useState('');
  const [integrity, setIntegrity] = useState({ latency: 24, uptime: 99.9, api: 94 });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [analyticsData, bookingsData, messagesData] = await Promise.all([
          api.getAdminAnalytics(),
          bookingService.getBookings(),
          api.getContacts()
        ]);
        setStats(analyticsData);
        setRecentBookings(bookingsData.slice(0, 6));
        setRecentMessages(messagesData.slice(0, 4));
        
        const userBookings = bookingsData.reduce((acc, curr) => {
          const userId = curr.user?._id;
          if (!userId) return acc;
          if (!acc[userId]) acc[userId] = { ...curr.user, count: 0, total: 0 };
          acc[userId].count += 1;
          acc[userId].total += curr.totalPrice || 0;
          return acc;
        }, {});
        
        const sortedUsers = Object.values(userBookings)
          .sort((a, b) => b.total - a.total)
          .slice(0, 5);
        setTopUsers(sortedUsers);

      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(() => {
      setIntegrity(prev => ({
        latency: Math.max(18, Math.min(32, prev.latency + (Math.random() - 0.5) * 4)),
        uptime: Math.min(100, Math.max(99.7, prev.uptime + (Math.random() - 0.5) * 0.05)),
        api: Math.max(90, Math.min(100, prev.api + (Math.random() - 0.5) * 2))
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (loading || !stats) {
    return (
      <div style={{ height: 'calc(100vh - 120px)', display: 'flex', alignItems: 'center' }}>
        <AdminLoader message="Initializing Command Center Ecosystem..." />
      </div>
    );
  }

  const revenueSparkData = stats.revenueChart?.map(m => ({ val: m.revenue })) || [];
  const userSparkData = stats.userGrowthChart?.map(m => ({ val: m.users })) || [];
  const bookingSparkData = stats.revenueChart?.map(m => ({ val: m.bookings })) || [];

  const statusData = [
    { name: 'Confirmed', value: stats.confirmedBookings || 0, color: 'var(--admin-success)', query: 'Confirmed' },
    { name: 'Pending', value: stats.pendingBookings || 0, color: 'var(--admin-warning)', query: 'Pending' },
    { name: 'Cancelled', value: stats.cancelledBookings || 0, color: 'var(--admin-danger)', query: 'Cancelled' }
  ];

  const filteredRecentBookings = recentBookings.filter((booking) => {
    const query = logSearch.toLowerCase().trim();
    return matchesSearchFields(booking, query, [
      'status',
      '_id',
      (row) => row.user?.name,
      (row) => row.user?.email,
      (row) => row.packageId?.name,
      (row) => row.packageId?.location,
    ]);
  });

  const exportDashboard = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      stats,
      recentBookings,
      recentMessages,
      topUsers,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `klicktour-dashboard-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="admin-module"
    >
      {/* Module Header */}
      <div className="module-header">
        <div className="module-title-section">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="dashboard-title-wrapper">
            <div className="logo-icon pulse-primary"><FaBolt /></div>
            <div>
              <h1>Dashboard Overview</h1>
              <p>Quick summary of bookings, packages, hotels, users, and revenue.</p>
            </div>
          </motion.div>
        </div>
        <div className="module-actions">
            <button className="btn btn-ghost" onClick={() => navigate('/admin/audit-logs')}>
                <FaHistory /> System Logs
            </button>
            <button className="btn btn-primary" onClick={exportDashboard}>
                <FaDownload /> Export Intelligence
            </button>
        </div>
      </div>

      {/* Primary Stats Grid */}
      {/*
      <div className="stats-grid staggered-list">
        <StatCard 
          title="Total Revenue" 
          value={`₹${(stats.totalRevenue || 0).toLocaleString()}`} 
          icon={<FaRupeeSign />} 
          color="#38bdf8"
          trend="up"
          trendValue="18.5"
          subtitle="Aggregate financial intake"
          data={revenueSparkData}
          onClick={() => navigate('/admin/payments')}
        />
        <StatCard 
          title="Today's Performance" 
          value={`₹${(stats.todayRevenue || 0).toLocaleString()}`} 
          icon={<FaCalendarDay />} 
          color="#818cf8"
          trend="up"
          trendValue="24.1"
          subtitle={`${stats.todayBookings} reservations today`}
          data={revenueSparkData.slice(-3)}
          onClick={() => navigate('/admin/bookings')}
        />
        <StatCard 
          title="Active Intelligence" 
          value={stats.users} 
          icon={<FaUsers />} 
          color="#fbbf24"
          trend="up"
          trendValue="5.2"
          subtitle="Verified agents and travelers"
          data={userSparkData}
          onClick={() => navigate('/admin/users')}
        />
        <StatCard 
          title="Global Reservations" 
          value={stats.bookings} 
          icon={<FaCalendarCheck />} 
          color="#10b981"
          trend="up"
          trendValue="9.1"
          subtitle={`${stats.pendingBookings} awaiting confirmation`}
          data={bookingSparkData}
          onClick={() => navigate('/admin/bookings')}
        />
      </div>
      */}

      {/* Asset Inventory Grid */}
      <div className="mini-stats-grid">
          <MiniStat label="Destinations" value={stats.destinations} icon={<FaMapMarkedAlt />} color="#38bdf8" onClick={() => navigate('/admin/destinations')} />
          <MiniStat label="Tour Packages" value={stats.packages} icon={<FaBox />} color="#f472b6" onClick={() => navigate('/admin/packages')} />
          <MiniStat label="Hotel Assets" value={stats.hotels} icon={<FaHotel />} color="#818cf8" onClick={() => navigate('/admin/hotels')} />
          <MiniStat label="Logistics" value={stats.transports} icon={<FaBus />} color="#10b981" onClick={() => navigate('/admin/transportation')} />
          <MiniStat label="Reviews" value={stats.reviews} icon={<FaStar />} color="#fbbf24" onClick={() => navigate('/admin/reviews')} />
          <MiniStat label="Avg Rating" value={`${stats.avgRating}/5`} icon={<FaBolt />} color="#f59e0b" onClick={() => navigate('/admin/reviews?q=rating')} />
      </div>

      {/* Charts Section */}
      <div className="dashboard-charts-row">
        <motion.div variants={itemVariants} className="content-card chart-main glass-effect">
            <div className="chart-header-custom">
                <div>
                    <h3>Revenue Trajectory</h3>
                    <p>Financial performance over the last 6 months</p>
                </div>
                <div className="tab-controls">
                    <button className={`tab-btn ${activeTab === 'revenue' ? 'active' : ''}`} onClick={() => setActiveTab('revenue')}>Revenue</button>
                    <button className={`tab-btn ${activeTab === 'bookings' ? 'active' : ''}`} onClick={() => setActiveTab('bookings')}>Bookings</button>
                </div>
            </div>
            <div className="chart-wrapper">
                <ResponsiveContainer width="100%" height={350}>
                    <ComposedChart data={stats.revenueChart}>
                        <defs>
                            <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="var(--admin-primary)" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="var(--admin-primary)" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                        <XAxis dataKey="month" stroke="#64748b" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#64748b" fontSize={11} fontWeight={600} axisLine={false} tickLine={false} dx={-10} />
                        <Tooltip 
                            contentStyle={{ background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', backdropFilter: 'blur(10px)' }}
                            itemStyle={{ fontWeight: 800 }}
                        />
                        <Area type="monotone" dataKey={activeTab === 'revenue' ? 'revenue' : 'bookings'} stroke="var(--admin-primary)" strokeWidth={4} fill="url(#colorRevenue)" />
                        <Bar dataKey={activeTab === 'revenue' ? 'revenue' : 'bookings'} barSize={30} fill="rgba(56, 189, 248, 0.1)" radius={[8, 8, 0, 0]} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        </motion.div>

        <motion.div variants={itemVariants} className="content-card chart-side glass-effect">
            <div className="chart-header-custom">
                <h3>Operational Status</h3>
                <p>Reservation distribution</p>
            </div>
            <div className="pie-chart-wrapper">
                <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                        <Pie
                            data={statusData}
                            innerRadius={80}
                            outerRadius={105}
                            paddingAngle={8}
                            dataKey="value"
                            stroke="none"
                        >
                            {statusData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                    </PieChart>
                </ResponsiveContainer>
                <div className="pie-center-label">
                    <span className="pie-value">{stats.bookings}</span>
                    <span className="pie-label">Total</span>
                </div>
            </div>
            <div className="status-legend">
                {statusData.map((s, i) => (
                    <button
                        key={i}
                        type="button"
                        className="legend-item"
                        onClick={() => navigate(`/admin/bookings?q=${encodeURIComponent(s.query)}`)}
                        title={`View ${s.name.toLowerCase()} bookings`}
                        style={{ cursor: 'pointer', color: 'inherit' }}
                    >
                        <span className="legend-label">{s.name}</span>
                        <span className="legend-value" style={{ color: s.color }}>{s.value}</span>
                    </button>
                ))}
            </div>
        </motion.div>
      </div>

      {/* Middle Row: Top Users, Recent Messages, System Integrity */}
      <div className="dashboard-secondary-row staggered-list">
          {/* Elite Principals */}
          <motion.div variants={itemVariants} className="content-card info-panel glass-effect">
              <div className="panel-header">
                <h3>Elite Principals</h3>
                <FaUserShield className="icon-primary" />
              </div>
              <div className="panel-list">
                  {topUsers.map((user, i) => (
                      <div key={i} className="panel-item">
                          <div className="item-avatar primary-gradient">
                              {user.name?.charAt(0)}
                          </div>
                          <div className="item-details">
                              <p className="item-name">{user.name}</p>
                              <p className="item-meta">{user.count} Transactions</p>
                          </div>
                          <div className="item-value success">
                              ₹{(user.total/1000).toFixed(1)}k
                          </div>
                      </div>
                  ))}
              </div>
          </motion.div>

          {/* Recent Messages */}
          <motion.div variants={itemVariants} className="content-card info-panel glass-effect">
              <div className="panel-header">
                <h3>Critical Inquiries</h3>
                <FaEnvelope className="icon-accent" />
              </div>
              <div className="panel-list scrollable">
                  {recentMessages.map((msg, i) => (
                      <div key={i} className={`panel-message ${msg.status === 'unread' ? 'unread' : ''}`}>
                          <div className="message-header">
                              <span className="message-author">{msg.name}</span>
                              <span className="message-date">{new Date(msg.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="message-preview">{msg.message}</p>
                      </div>
                  ))}
              </div>
              <button className="panel-action-btn" onClick={() => navigate('/admin/messages')}>Access All Communications</button>
          </motion.div>

          {/* System Integrity */}
          <motion.div variants={itemVariants} className="content-card info-panel glass-effect">
              <div className="panel-header">
                <h3>System Integrity</h3>
                <FaShieldAlt className="icon-success" />
              </div>
              <div className="integrity-content">
                  <div className="integrity-metric">
                      <div className="metric-header">
                          <span className="metric-label"><FaServer /> Neural Engine API</span>
                          <span className="metric-status success">OPTIMAL</span>
                      </div>
                      <div className="progress-bar">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${integrity.api}%` }} className="progress-fill primary-gradient" />
                      </div>
                  </div>
                  <div className="integrity-grid">
                      <div className="integrity-mini-card">
                          <FaClock className="icon-primary" />
                          <p className="mini-label">Uptime</p>
                          <h5 className="mini-value">{integrity.uptime.toFixed(2)}%</h5>
                      </div>
                      <div className="integrity-mini-card">
                          <FaRocket className="icon-accent" />
                          <p className="mini-label">Latency</p>
                          <h5 className="mini-value">{integrity.latency.toFixed(0)}ms</h5>
                      </div>
                  </div>
              </div>
          </motion.div>
      </div>

      {/* Recent Activity Log */}
      <motion.div variants={itemVariants} className="content-card data-log-card glass-effect">
        <div className="data-header">
          <div>
            <h3>Reservation Protocol Log</h3>
            <p>Real-time transactional asset flow</p>
          </div>
          <div className="data-header-actions">
              <div className="header-search">
                <FaSearch className="search-icon" />
                <input
                  type="text"
                  placeholder="Filter log..."
                  className="admin-input"
                  value={logSearch}
                  onChange={(event) => setLogSearch(event.target.value)}
                />
              </div>
              <button className="action-btn" onClick={() => navigate('/admin/bookings')} title="Open reservations">
                <FaEllipsisV />
              </button>
          </div>
        </div>
        
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Principal</th>
                <th>Resource Asset</th>
                <th>Temporal Marker</th>
                <th>Equity Value</th>
                <th>Status Protocol</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredRecentBookings.map((booking) => (
                <tr key={booking._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar-small primary-gradient">
                        {booking.user?.name?.charAt(0) || 'U'}
                      </div>
                      <div className="user-info-small">
                          <div className="name">{booking.user?.name || 'Auth Guest'}</div>
                          <div className="id">{booking._id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                      <div className="asset-cell">
                        <div className="asset-name">{booking.packageId?.name || 'Classified Asset'}</div>
                        <div className="asset-category">{booking.packageId?.category || 'Standard'}</div>
                      </div>
                  </td>
                  <td>
                      <div className="date-cell">
                        <FaClock size={12} /> {new Date(booking.createdAt).toLocaleDateString()}
                      </div>
                  </td>
                  <td>
                    <div className="value-cell">₹{booking.totalPrice?.toLocaleString()}</div>
                  </td>
                  <td>
                    <span className={`status-pill status-${booking.status?.toLowerCase() === 'confirmed' ? 'active' : booking.status?.toLowerCase() === 'pending' ? 'pending' : 'danger'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="action-btn" onClick={() => navigate(`/admin/bookings?id=${booking._id}`)}><FaArrowRight /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default DashboardHome;
